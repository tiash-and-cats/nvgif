using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.IO.Compression;

namespace airsquirrel
{
    public static class NVGIF
    {
        public enum CompressionType : byte
        {
            None = 0,
            RLE = 1,
            Zlib = 2,
            RLE_Zlib = 3
        }

        private class NVGIFHeader
        {
            public int Version;
            public CompressionType Compression;
            public bool HasAlpha;
            public int Width;
            public int Height;
        }

        /// <summary>
        /// Decode an NVGIF buffer (v1..v4) and return a Bitmap.
        /// </summary>
        public static Bitmap Decode(byte[] nvgData)
        {
            using (var ms = new MemoryStream(nvgData))
            using (var br = new BinaryReader(ms))
            {
                NVGIFHeader header = ParseHeader(br);
                int bpp = header.HasAlpha ? 4 : 3;
                byte[] payload = br.ReadBytes((int)(ms.Length - ms.Position));

                if (header.Compression == CompressionType.Zlib || header.Compression == CompressionType.RLE_Zlib)
                {
                    try
                    {
                        payload = DecompressZlib(payload);
                    }
                    catch (InvalidDataException ide)
                    {
                        Console.WriteLine("[NVGIF] Zlib decompression failed: " + ide.Message);
                        throw;
                    }
                }

                byte[] pixels = new byte[header.Width * header.Height * bpp];
                int pixelOffset = 0;

                if (header.Version == 4 && header.Compression == CompressionType.Zlib)
                {
                    if (payload.Length < pixels.Length)
                        throw new InvalidDataException("Incomplete pixel data for Zlib compression.");

                    Array.Copy(payload, 0, pixels, 0, pixels.Length);
                }
                /*else if (header.Version == 4 && header.Compression == CompressionType.RLE_Zlib)
                {
                    Console.WriteLine($"[NVGIF] Decompressed RLE_Zlib payload: {payload.Length} bytes");

                    int testOffset = 0;
                    for (int y = 0; y < header.Height; y++)
                    {
                        if (testOffset + 2 > payload.Length)
                            throw new InvalidDataException($"Row {y}: missing row length");

                        ushort rowLen = (ushort)((payload[testOffset] << 8) | payload[testOffset + 1]);
                        testOffset += 2;

                        if (testOffset + rowLen > payload.Length)
                            throw new InvalidDataException($"Row {y}: row overrun: {testOffset + rowLen} > {payload.Length}");

                        testOffset += rowLen;
                    }

                    Console.WriteLine("[NVGIF] Decompressed rows parsed cleanly.");
                }*/
                else if (header.Version == 4 && header.Compression == CompressionType.RLE_Zlib)
{
                    Console.WriteLine($"[Before] Zlib header: 0x{payload[0]:X2} 0x{payload[1]:X2}");

                    //payload = DecompressZlib(payload);
                    Console.WriteLine($"[After] First 2 bytes of decompressed: 0x{payload[0]:X2} 0x{payload[1]:X2}");

                    int readOffset = 0;
                     
                    for (int y = 0; y < header.Height; y++)
                    {
                        if (readOffset + 2 > payload.Length)
                            throw new InvalidDataException($"Row {y}: missing length prefix");

                        ushort rowLen = (ushort)((payload[readOffset] << 8) | payload[readOffset + 1]);
                        readOffset += 2;

                        if (readOffset + rowLen > payload.Length)
                            throw new InvalidDataException($"Row {y}: row data truncated");

                        byte[] rowData = new byte[rowLen];
                        Array.Copy(payload, readOffset, rowData, 0, rowLen);
                        readOffset += rowLen;

                        byte[] decoded = RLEDecode(rowData, bpp, header.Width * bpp);
                        if (decoded.Length != header.Width * bpp)
                            throw new InvalidDataException($"Row {y}: decoded length mismatch (got {decoded.Length}, expected {header.Width * bpp})");

                        Array.Copy(decoded, 0, pixels, y * header.Width * bpp, decoded.Length);
                    }
                }
                else
                {
                    int readOffset = 0;
                    for (int y = 0; y < header.Height; y++)
                    {
                        if (readOffset + 2 > payload.Length)
                            throw new InvalidDataException($"Row {y}: missing length prefix");

                        ushort rowLen = (ushort)((payload[readOffset] << 8) | payload[readOffset + 1]);
                        readOffset += 2;

                        if (readOffset + rowLen > payload.Length)
                            throw new InvalidDataException($"Row {y}: row data truncated");

                        byte[] rowData = new byte[rowLen];
                        Array.Copy(payload, readOffset, rowData, 0, rowLen);
                        readOffset += rowLen;

                        byte[] decoded = (header.Compression == CompressionType.RLE)
                            ? RLEDecode(rowData, bpp, header.Width * bpp)
                            : rowData;

                        if (decoded.Length != header.Width * bpp)
                            throw new InvalidDataException(
                                $"Row {y}: decoded length mismatch (got {decoded.Length}, expected {header.Width * bpp})");

                        Array.Copy(decoded, 0, pixels, pixelOffset, decoded.Length);
                        pixelOffset += decoded.Length;
                    }
                }

                Bitmap bmp = new Bitmap(header.Width, header.Height);
                int i = 0;
                for (int y = 0; y < header.Height; y++)
                {
                    for (int x = 0; x < header.Width; x++)
                    {
                        byte r = pixels[i++];
                        byte g = pixels[i++];
                        byte b = pixels[i++];
                        byte a = header.HasAlpha ? pixels[i++] : (byte)255;
                        bmp.SetPixel(x, y, Color.FromArgb(a, r, g, b));
                    }
                }

                return bmp;
            }
        }

        private static NVGIFHeader ParseHeader(BinaryReader br)
        {
            // magic + version
            byte[] magic = br.ReadBytes(3);
            if (magic[0] != (byte)'N' || magic[1] != (byte)'V' || magic[2] != (byte)'G')
                throw new InvalidDataException("Invalid NVGIF magic");

            int version = br.ReadByte();
            CompressionType compression = CompressionType.None;
            bool hasAlpha = false;
            int width = 0, height = 0;

            switch (version)
            {
                case 1:
                    // NVGIFv1: [magic][ver][w:2][h:2]
                    width = (br.ReadByte() << 8) | br.ReadByte();
                    height = (br.ReadByte() << 8) | br.ReadByte();
                    break;

                case 2:
                    // NVGIFv2: [magic][ver][comp][w:2][h:2]
                    compression = (CompressionType)br.ReadByte();
                    width = (br.ReadByte() << 8) | br.ReadByte();
                    height = (br.ReadByte() << 8) | br.ReadByte();
                    break;

                case 3:
                    // NVGIFv3: [magic][ver][comp][alpha][w:2][h:2]
                    compression = (CompressionType)br.ReadByte();
                    hasAlpha = br.ReadByte() == 1;
                    width = (br.ReadByte() << 8) | br.ReadByte();
                    height = (br.ReadByte() << 8) | br.ReadByte();
                    break;

                case 4:
                    // NVGIFv4: [magic][ver][comp][alpha][w:2][h:2][reserved:1]
                    compression = (CompressionType)br.ReadByte();
                    hasAlpha = br.ReadByte() == 1;
                    width = (br.ReadByte() << 8) | br.ReadByte();
                    height = (br.ReadByte() << 8) | br.ReadByte();
                    br.ReadByte();  // reserved
                    break;

                default:
                    throw new InvalidDataException($"Unsupported NVGIF version: {version}");
            }

            return new NVGIFHeader
            {
                Version = version,
                Compression = compression,
                HasAlpha = hasAlpha,
                Width = width,
                Height = height
            };
        }

        private static byte[] RLEDecode(byte[] data, int bpp, int expectedLength)
        {
            var result = new byte[expectedLength];
            int i = 0, o = 0;

            while (i < data.Length && o + bpp <= expectedLength)
            {
                byte count = data[i++];
                if (i + bpp > data.Length)
                    break;

                for (int j = 0; j < count; j++)
                {
                    if (o + bpp > expectedLength)
                        break;

                    Array.Copy(data, i, result, o, bpp);
                    o += bpp;
                }

                i += bpp;
            }

            // Optional: fill remainder with 0s if truncated
            while (o < expectedLength)
                result[o++] = 0;

            return result;
        }

        private static byte[] DecompressZlib(byte[] data)
        {
            // Validate minimum length: 2-byte header + 4-byte footer
            if (data.Length < 6)
                throw new InvalidDataException("Zlib stream too short");

            // Skip 2-byte zlib header and 4-byte Adler32 checksum at the end
            int deflateLength = data.Length - 6;
            if (deflateLength <= 0)
                throw new InvalidDataException("Deflate stream length invalid");

            Console.WriteLine($"Zlib header: 0x{data[0]:X2} 0x{data[1]:X2}");
            using (var input = new MemoryStream(data, 2, deflateLength))
            using (var deflate = new DeflateStream(input, CompressionMode.Decompress))
            using (var output = new MemoryStream())
            {
                deflate.CopyTo(output);
                return output.ToArray();
            }
        }
    }
}