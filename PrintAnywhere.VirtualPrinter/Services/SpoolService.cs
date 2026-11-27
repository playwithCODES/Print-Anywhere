using System.Text.Json;
using PrintAnywhere.VirtualPrinter.Models;

namespace PrintAnywhere.VirtualPrinter.Services;

public sealed class SpoolService
{
    private static int _nextJobId = 0;
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

    private readonly string _spoolDirectory;
    private readonly string? _electronWebhookUrl;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<SpoolService> _logger;

    public SpoolService(
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<SpoolService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;

   string? configuredDir = configuration["Spool:Directory"];
        _spoolDirectory = !string.IsNullOrWhiteSpace(configuredDir)
            ? configuredDir
            : Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
                "PrintAnywhere",
                "spool");

        _electronWebhookUrl = configuration["ElectronAgent:WebhookUrl"];
        Directory.CreateDirectory(_spoolDirectory);
    }

    public async Task<PrintJobMetadata> SaveJobAsync(
        IReadOnlyDictionary<string, string> attributes,
        byte[] documentBytes,
        CancellationToken cancellationToken = default)
    {
        Directory.CreateDirectory(_spoolDirectory);

        int jobId = Interlocked.Increment(ref _nextJobId);
        bool isPdf = IsPdfPayload(documentBytes);
        string ext = isPdf ? ".pdf" : ".bin";

        string baseName = $"job_{DateTime.UtcNow:yyyyMMdd_HHmmss}_{jobId}";
        string docPath = Path.Combine(_spoolDirectory, baseName + ext);
        string tempMetaPath = Path.Combine(_spoolDirectory, baseName + ".json.tmp");
        string finalMetaPath = Path.Combine(_spoolDirectory, baseName + ".json");

        // 1. Write the raw document file first
        await File.WriteAllBytesAsync(docPath, documentBytes, cancellationToken);

        var metadata = new PrintJobMetadata
        {
            JobId = jobId,
            JobName = attributes.GetValueOrDefault("job-name", "Untitled Document"),
            RequestingUser = attributes.GetValueOrDefault("requesting-user-name", Environment.UserName),
            DocumentFormat = attributes.GetValueOrDefault(
                "document-format",
                isPdf ? "application/pdf" : "application/octet-stream"),
            Copies = int.TryParse(attributes.GetValueOrDefault("copies", "1"), out int copies) ? copies : 1,
            FilePath = docPath,
            SizeBytes = documentBytes.Length,
            CapturedAtUtc = DateTime.UtcNow,
            Status = "captured"
        };

        // 2. Write metadata atomically (.tmp -> .json) so Electron's file watcher only triggers once the PDF is ready
        string json = JsonSerializer.Serialize(metadata, JsonOptions);
        await File.WriteAllTextAsync(tempMetaPath, json, cancellationToken);
        File.Move(tempMetaPath, finalMetaPath, overwrite: true);

        _logger.LogInformation("Captured print job #{JobId} -> {DocPath} ({Size} bytes)", jobId, docPath, documentBytes.Length);

        // 3. Best-effort local ping to the Electron agent if it is running
        await NotifyElectronAgentAsync(metadata, cancellationToken);

        return metadata;
    }

    private async Task NotifyElectronAgentAsync(PrintJobMetadata metadata, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_electronWebhookUrl))
            return;

        try
        {
            using var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(2);
            using var response = await client.PostAsJsonAsync(_electronWebhookUrl, metadata, cancellationToken);
            _logger.LogInformation("Notified Electron agent for job #{JobId} (HTTP {Status})", metadata.JobId, (int)response.StatusCode);
        }
        catch (Exception ex)
        {
            // Keep job safely in the spool folder even if Electron is offline
            _logger.LogDebug("Electron agent unreachable ({Message}); job #{JobId} remains queued in spool.", ex.Message, metadata.JobId);
        }
    }

    private static bool IsPdfPayload(byte[] bytes) =>
        bytes.Length >= 4 &&
        bytes[0] == 0x25 && // %
        bytes[1] == 0x50 && // P
        bytes[2] == 0x44 && // D
        bytes[3] == 0x46;   // F
}