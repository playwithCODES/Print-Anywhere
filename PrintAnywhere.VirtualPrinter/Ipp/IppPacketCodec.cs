using System.Buffers.Binary;
using System.Text;
using PrintAnywhere.VirtualPrinter.Models;

namespace PrintAnywhere.VirtualPrinter.Ipp;

public static class IppPacketCodec
{
    public static Dictionary<string, string> ParseAttributes(byte[] data, int offset, out int payloadOffset)
    {
        var attrs = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        string currentName = string.Empty;
        int i = offset;

        while (i < data.Length)
        {
            byte tag = data[i++];

            if (tag == IppConstants.TagEndOfAttributes)
            {
                payloadOffset = i;
                return attrs;
            }

            // Delimiter tags (0x00 - 0x0F) mark attribute groups and carry no name/value
            if (tag <= 0x0F)
                continue;

            if (i + 2 > data.Length) break;
            ushort nameLen = BinaryPrimitives.ReadUInt16BigEndian(data.AsSpan(i, 2));
            i += 2;

            if (nameLen > 0)
            {
                if (i + nameLen > data.Length) break;
                currentName = Encoding.UTF8.GetString(data, i, nameLen);
                i += nameLen;
            }

            if (i + 2 > data.Length) break;
            ushort valLen = BinaryPrimitives.ReadUInt16BigEndian(data.AsSpan(i, 2));
            i += 2;

            if (i + valLen > data.Length) break;

            if (!string.IsNullOrEmpty(currentName) && !attrs.ContainsKey(currentName))
            {
                if ((tag == IppConstants.TagInteger || tag == IppConstants.TagEnum) && valLen == 4)
                    attrs[currentName] = BinaryPrimitives.ReadInt32BigEndian(data.AsSpan(i, 4)).ToString();
                else if (tag == IppConstants.TagBoolean && valLen == 1)
                    attrs[currentName] = (data[i] != 0).ToString();
                else
                    attrs[currentName] = Encoding.UTF8.GetString(data, i, valLen);
            }

            i += valLen;
        }

        payloadOffset = data.Length;
        return attrs;
    }

    public static void WriteHeader(MemoryStream ms, byte major, byte minor, ushort statusCode, int requestId)
    {
        ms.WriteByte(major);
        ms.WriteByte(minor);

        Span<byte> buf = stackalloc byte[6];
        BinaryPrimitives.WriteUInt16BigEndian(buf[..2], statusCode);
        BinaryPrimitives.WriteInt32BigEndian(buf[2..6], requestId);
        ms.Write(buf);
    }

    public static void WriteStringAttr(MemoryStream ms, byte tag, string name, string value)
    {
        ms.WriteByte(tag);
        byte[] nameBytes = Encoding.UTF8.GetBytes(name);
        byte[] valBytes = Encoding.UTF8.GetBytes(value);
        Span<byte> lenBuf = stackalloc byte[2];

        BinaryPrimitives.WriteUInt16BigEndian(lenBuf, (ushort)nameBytes.Length);
        ms.Write(lenBuf);
        if (nameBytes.Length > 0) ms.Write(nameBytes);

        BinaryPrimitives.WriteUInt16BigEndian(lenBuf, (ushort)valBytes.Length);
        ms.Write(lenBuf);
        if (valBytes.Length > 0) ms.Write(valBytes);
    }

    public static void WriteIntAttr(MemoryStream ms, byte tag, string name, int value)
    {
        ms.WriteByte(tag);
        byte[] nameBytes = Encoding.UTF8.GetBytes(name);
        Span<byte> buf = stackalloc byte[6];

        BinaryPrimitives.WriteUInt16BigEndian(buf[..2], (ushort)nameBytes.Length);
        ms.Write(buf[..2]);
        if (nameBytes.Length > 0) ms.Write(nameBytes);

        BinaryPrimitives.WriteUInt16BigEndian(buf[..2], 4);
        BinaryPrimitives.WriteInt32BigEndian(buf[2..6], value);
        ms.Write(buf);
    }

    public static void WriteBoolAttr(MemoryStream ms, string name, bool value)
    {
        ms.WriteByte(IppConstants.TagBoolean);
        byte[] nameBytes = Encoding.UTF8.GetBytes(name);
        Span<byte> lenBuf = stackalloc byte[2];

        BinaryPrimitives.WriteUInt16BigEndian(lenBuf, (ushort)nameBytes.Length);
        ms.Write(lenBuf);
        if (nameBytes.Length > 0) ms.Write(nameBytes);

        BinaryPrimitives.WriteUInt16BigEndian(lenBuf, 1);
        ms.Write(lenBuf);
        ms.WriteByte(value ? (byte)0x01 : (byte)0x00);
    }
}