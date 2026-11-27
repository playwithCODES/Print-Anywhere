namespace PrintAnywhere.VirtualPrinter.Models;

public sealed class PrintJobMetadata
{
    public int JobId { get; init; }
    public string JobName { get; init; } = "Untitled Document";
    public string RequestingUser { get; init; } = string.Empty;
    public string DocumentFormat { get; init; } = "application/pdf";
    public int Copies { get; init; } = 1;
    public string FilePath { get; init; } = string.Empty;
    public long SizeBytes { get; init; }
    public DateTime CapturedAtUtc { get; init; } = DateTime.UtcNow;
    public string Status { get; init; } = "captured";
}