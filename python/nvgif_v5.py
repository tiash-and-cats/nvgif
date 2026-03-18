"""
NVGIF Python implementation
Copyright (c) tiash-and-cats & contributors
The NVGIF docs & reference implementations are licensed under the MIT License.
In practice this means you can use this code in your projects without paying
any kind of fee or subscription.

This file provides an encoder and decoder for NVGIFv5.
"""
import zlib
import warnings
from PIL import Image
from enum import IntFlag

class NVGIFv5:
    VERSION = 5
    HEADER_MAGIC = b"NVG"

    class CompressionType(IntFlag):
        NONE = 0
        RLE = 1
        ZLIB = 2
        RGB565 = 4
    
    RETURN_IMAGE = 1

    def __init__(self):
        self.width = 0
        self.height = 0

    def _rle_encode(self, data: bytes) -> bytes:
        encoded = bytearray()
        i = 0
        while i < len(data):
            value = data[i]
            count = 1
            while i + count < len(data) and data[i + count] == value and count < 255:
                count += 1
            encoded.append(count)
            encoded.append(value)
            i += count
        return bytes(encoded)

    def _rgb565_encode(self, r, g, b):
        r5 = (r >> 3) & 0x1F   # top 5 bits of red
        g6 = (g >> 2) & 0x3F   # top 6 bits of green
        b5 = (b >> 3) & 0x1F   # top 5 bits of blue
        return (r5 << 11) | (g6 << 5) | b5

    def encode(self, image_or_path, out_path, compression=CompressionType.RLE | CompressionType.ZLIB, alpha=False):
        if isinstance(image_or_path, Image.Image):
            img = image_or_path.convert("RGBA")
        else:
            img = Image.open(image_or_path).convert("RGBA")

        self.width, self.height = img.size
        bpp = 4 if alpha else 3

        if alpha and compression & self.CompressionType.RGB565:
            warnings.warn("RGB565 encoding cannot have alpha. Alpha will not be enabled.", UserWarning)
            bpp = 3
            alpha = False

        raw = bytearray()
        
        if not compression & self.CompressionType.RGB565:
            for y in range(self.height):
                row = bytearray()
                for x in range(self.width):
                    r, g, b, a = img.getpixel((x, y))
                    row.extend([r, g, b, a] if alpha else [r, g, b])
                raw.extend(len(row).to_bytes(2, "big"))
                raw.extend(row)
        else:
            for y in range(self.height):
                row = bytearray()
                for x in range(self.width):
                    r, g, b, a = img.getpixel((x, y))
                    val = self._rgb565_encode(r, g, b)
                    row.extend(val.to_bytes(2, "big"))
                raw.extend(len(row).to_bytes(2, "big"))
                raw.extend(row)
        
        if compression & self.CompressionType.RLE:
            raw = self._rle_encode(raw)

        if compression & self.CompressionType.ZLIB:
            raw = zlib.compress(raw, level=9)

        with open(out_path, "wb") as f:
            f.write(self.HEADER_MAGIC)
            f.write(bytes([self.VERSION]))
            f.write(bytes([compression]))
            f.write(bytes([alpha]))
            f.write(self.width.to_bytes(2, "big"))
            f.write(self.height.to_bytes(2, "big"))
            f.write(bytes([0]))  # Reserved
            f.write(raw)

    def _rle_decode(self, data):
        decoded = bytearray()
        i = 0
        while i < len(data):
            count = data[i]
            value = data[i+1]
            decoded.extend([value] * count)
            i += 2
        return bytes(decoded)
    
    def _rgb565_decode(self, value):
        r = ((value >> 11) & 0x1F) << 3
        g = ((value >> 5) & 0x3F) << 2
        b = (value & 0x1F) << 3
        return r, g, b
    
    def decode(self, nvg_path, png_path=RETURN_IMAGE):
        with open(nvg_path, "rb") as f:
            header = f.read(3)
            if header != self.HEADER_MAGIC:
                raise ValueError("Invalid NVGIF header")
    
            version = f.read(1)[0]
            compression = f.read(1)[0]
            alpha = f.read(1)[0]
            self.width = int.from_bytes(f.read(2), "big")
            self.height = int.from_bytes(f.read(2), "big")
            reserved = f.read(1)
            raw = f.read()
    
        # Decompress if needed
        if compression & self.CompressionType.ZLIB:
            raw = zlib.decompress(raw)
    
        # RLE decode if needed
        if compression & self.CompressionType.RLE:
            raw = self._rle_decode(raw)
    
        pixels = bytearray()
        if compression & self.CompressionType.RGB565:
            # Each row is prefixed with length
            i = 0
            for _ in range(self.height):
                row_len = int.from_bytes(raw[i:i+2], "big")
                i += 2
                row = raw[i:i+row_len]
                i += row_len
                for j in range(0, len(row), 2):
                    val = int.from_bytes(row[j:j+2], "big")
                    r, g, b = self._rgb565_decode(val)
                    pixels.extend([r, g, b])
        else:
            i = 0
            for _ in range(self.height):
                row_len = int.from_bytes(raw[i:i+2], "big")
                i += 2
                row = raw[i:i+row_len]
                i += row_len
                pixels.extend(row)
    
        mode = "RGBA" if alpha else "RGB"
        out = Image.frombytes(mode, (self.width, self.height), bytes(pixels))
    
        if png_path == self.RETURN_IMAGE:
            return out
        else:
            out.save(png_path)