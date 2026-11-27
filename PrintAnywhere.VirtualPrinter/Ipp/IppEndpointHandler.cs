using System.Buffers.Binary;
using PrintAnywhere.VirtualPrinter.Models;
using PrintAnywhere.VirtualPrinter.Services;

namespace PrintAnywhere.VirtualPrinter.Ipp;

public sealed class IppEndpointHandler
{
    private static readonly DateTime StartTimeUtc = DateTime.UtcNow;

    private readonly SpoolService _spoolService;
    private readonly string _printerUri;
    private readonly string _printerName;
    private readonly ILogger<IppEndpointHandler> _logger;

    public IppEndpointHandler(
        SpoolService spoolService,
        IConfiguration configuration,
        ILogger<IppEndpointHandler> logger)
    {
        _spoolService = spoolService;
        _logger = logger;

        int port = configuration.GetValue("Server:Port", 6310);
        _printerUri = $"http://127.0.0.1:{port}/ipp/print";
        _printerName = configuration["Printer:Name"] ?? "Print Anywhere Virtual Printer";
    }

    public async Task HandleRequestAsync(HttpContext context)
    {
        using var ms = new MemoryStream();
        await context.Request.Body.CopyToAsync(ms, context.RequestAborted);
        byte[] data = ms.ToArray();

        if (data.Length < 9)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return;
        }

        byte major = data[0];
        byte minor = data[1];
        ushort operationId = BinaryPrimitives.ReadUInt16BigEndian(data.AsSpan(2, 2));
        int requestId = BinaryPrimitives.ReadInt32BigEndian(data.AsSpan(4, 4));

        var attributes = IppPacketCodec.ParseAttributes(data, 8, out int payloadOffset);
        int payloadLength = Math.Max(0, data.Length - payloadOffset);

        _logger.LogInformation("[IPP] Op=0x{Op:X4} | ReqId={ReqId} | PayloadBytes={Bytes}", operationId, requestId, payloadLength);

        byte[] responseBytes = operationId switch
        {
            IppConstants.OpGetPrinterAttributes => BuildGetPrinterAttributesResponse(major, minor, requestId),
            IppConstants.OpValidateJob => BuildSimpleOkResponse(major, minor, requestId),
            IppConstants.OpPrintJob => await HandlePrintJobAsync(major, minor, requestId, attributes, data, payloadOffset, context.RequestAborted),
            IppConstants.OpGetJobAttributes => BuildJobAttributesResponse(major, minor, requestId, ParseJobId(attributes)),
            IppConstants.OpGetJobs => BuildSimpleOkResponse(major, minor, requestId),
            IppConstants.OpCancelJob => BuildSimpleOkResponse(major, minor, requestId),
            _ => BuildSimpleOkResponse(major, minor, requestId)
        };

        context.Response.StatusCode = StatusCodes.Status200OK;
        context.Response.ContentType = "application/ipp";
        await context.Response.Body.WriteAsync(responseBytes, context.RequestAborted);
    }

    private async Task<byte[]> HandlePrintJobAsync(
        byte major,
        byte minor,
        int requestId,
        Dictionary<string, string> attributes,
        byte[] data,
        int payloadOffset,
        CancellationToken cancellationToken)
    {
        int payloadLength = Math.Max(0, data.Length - payloadOffset);
        byte[] documentBytes = new byte[payloadLength];
        if (payloadLength > 0)
            Buffer.BlockCopy(data, payloadOffset, documentBytes, 0, payloadLength);

        PrintJobMetadata metadata = await _spoolService.SaveJobAsync(attributes, documentBytes, cancellationToken);
        return BuildJobAttributesResponse(major, minor, requestId, metadata.JobId);
    }

    private static int ParseJobId(IReadOnlyDictionary<string, string> attributes) =>
        int.TryParse(attributes.GetValueOrDefault("job-id", "1"), out int id) ? id : 1;

    private static byte[] BuildSimpleOkResponse(byte major, byte minor, int requestId)
    {
        using var ms = new MemoryStream();
        IppPacketCodec.WriteHeader(ms, major, minor, IppConstants.StatusSuccessfulOk, requestId);
        ms.WriteByte(IppConstants.TagOperationAttributes);
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagCharset, "attributes-charset", "utf-8");
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagNaturalLanguage, "attributes-natural-language", "en-us");
        ms.WriteByte(IppConstants.TagEndOfAttributes);
        return ms.ToArray();
    }

    private byte[] BuildJobAttributesResponse(byte major, byte minor, int requestId, int jobId)
    {
        using var ms = new MemoryStream();
        IppPacketCodec.WriteHeader(ms, major, minor, IppConstants.StatusSuccessfulOk, requestId);

        ms.WriteByte(IppConstants.TagOperationAttributes);
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagCharset, "attributes-charset", "utf-8");
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagNaturalLanguage, "attributes-natural-language", "en-us");

        ms.WriteByte(IppConstants.TagJobAttributes);
        IppPacketCodec.WriteIntAttr(ms, IppConstants.TagInteger, "job-id", jobId);
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagUri, "job-uri", $"{_printerUri}/jobs/{jobId}");
        IppPacketCodec.WriteIntAttr(ms, IppConstants.TagEnum, "job-state", 9); // completed
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagKeyword, "job-state-reasons", "job-completed-successfully");

        ms.WriteByte(IppConstants.TagEndOfAttributes);
        return ms.ToArray();
    }

    private byte[] BuildGetPrinterAttributesResponse(byte major, byte minor, int requestId)
    {
        using var ms = new MemoryStream();
        IppPacketCodec.WriteHeader(ms, major, minor, IppConstants.StatusSuccessfulOk, requestId);

        ms.WriteByte(IppConstants.TagOperationAttributes);
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagCharset, "attributes-charset", "utf-8");
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagNaturalLanguage, "attributes-natural-language", "en-us");

        ms.WriteByte(IppConstants.TagPrinterAttributes);
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagUri, "printer-uri-supported", _printerUri);
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagKeyword, "uri-security-supported", "none");
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagKeyword, "uri-authentication-supported", "none");
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagNameWithoutLanguage, "printer-name", _printerName);
        IppPacketCodec.WriteIntAttr(ms, IppConstants.TagEnum, "printer-state", 3); // idle
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagKeyword, "printer-state-reasons", "none");

        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagKeyword, "ipp-versions-supported", "1.1");
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagKeyword, "", "2.0");

        IppPacketCodec.WriteIntAttr(ms, IppConstants.TagEnum, "operations-supported", IppConstants.OpPrintJob);
        IppPacketCodec.WriteIntAttr(ms, IppConstants.TagEnum, "", IppConstants.OpValidateJob);
        IppPacketCodec.WriteIntAttr(ms, IppConstants.TagEnum, "", IppConstants.OpCancelJob);
        IppPacketCodec.WriteIntAttr(ms, IppConstants.TagEnum, "", IppConstants.OpGetJobAttributes);
        IppPacketCodec.WriteIntAttr(ms, IppConstants.TagEnum, "", IppConstants.OpGetJobs);
        IppPacketCodec.WriteIntAttr(ms, IppConstants.TagEnum, "", IppConstants.OpGetPrinterAttributes);

        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagCharset, "charset-configured", "utf-8");
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagCharset, "charset-supported", "utf-8");
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagNaturalLanguage, "natural-language-configured", "en-us");
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagNaturalLanguage, "generated-natural-language-supported", "en-us");
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagMimeMediaType, "document-format-default", "application/pdf");
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagMimeMediaType, "document-format-supported", "application/pdf");
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagMimeMediaType, "", "application/octet-stream");
        IppPacketCodec.WriteBoolAttr(ms, "printer-is-accepting-jobs", true);
        IppPacketCodec.WriteIntAttr(ms, IppConstants.TagInteger, "queued-job-count", 0);
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagKeyword, "pdl-override-supported", "attempted");
        IppPacketCodec.WriteBoolAttr(ms, "color-supported", true);
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagKeyword, "sides-default", "one-sided");
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagKeyword, "sides-supported", "one-sided");
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagKeyword, "", "two-sided-long-edge");
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagKeyword, "", "two-sided-short-edge");
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagKeyword, "media-default", "iso_a4_210x297mm");
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagKeyword, "media-supported", "iso_a4_210x297mm");
        IppPacketCodec.WriteStringAttr(ms, IppConstants.TagKeyword, "", "na_letter_8.5x11in");
        IppPacketCodec.WriteIntAttr(ms, IppConstants.TagInteger, "printer-up-time", Math.Max(1, (int)(DateTime.UtcNow - StartTimeUtc).TotalSeconds));

        ms.WriteByte(IppConstants.TagEndOfAttributes);
        return ms.ToArray();
    }
}