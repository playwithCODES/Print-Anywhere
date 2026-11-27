namespace PrintAnywhere.VirtualPrinter.Models;

public static class IppConstants
{
    // IPP Operation IDs (RFC 8011)
    public const ushort OpPrintJob = 0x0002;
    public const ushort OpValidateJob = 0x0004;
    public const ushort OpCancelJob = 0x0008;
    public const ushort OpGetJobAttributes = 0x0009;
    public const ushort OpGetJobs = 0x000A;
    public const ushort OpGetPrinterAttributes = 0x000B;

    // IPP Status Codes
    public const ushort StatusSuccessfulOk = 0x0000;

    // Delimiter Tags
    public const byte TagOperationAttributes = 0x01;
    public const byte TagJobAttributes = 0x02;
    public const byte TagEndOfAttributes = 0x03;
    public const byte TagPrinterAttributes = 0x04;

    // Value Tags
    public const byte TagInteger = 0x21;
    public const byte TagBoolean = 0x22;
    public const byte TagEnum = 0x23;
    public const byte TagNameWithoutLanguage = 0x42;
    public const byte TagKeyword = 0x44;
    public const byte TagUri = 0x45;
    public const byte TagCharset = 0x47;
    public const byte TagNaturalLanguage = 0x48;
    public const byte TagMimeMediaType = 0x49;
}