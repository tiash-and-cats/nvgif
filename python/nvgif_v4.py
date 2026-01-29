import zlib
from PIL import Image


class NVGIFv4:
    VERSION = 4
    HEADER_MAGIC = b"NVG"

    COMPRESSION_NONE = 0
    COMPRESSION_RLE = 1
    COMPRESSION_ZLIB = 2
    COMPRESSION_RLE_ZLIB = 3  # future use

    ALPHA_DISABLED = 0
    ALPHA_ENABLED = 1
    
    RETURN_IMAGE = 1

    def __init__(self):
        self.width = 0
        self.height = 0

    def _rle_encode(self, data: bytearray, bpp: int) -> bytearray:
        encoded = bytearray()
        i = 0
        while i < len(data):
            chunk = data[i:i+bpp]
            count = 1
            while (
                i + bpp * (count + 1) <= len(data)
                and data[i:i+bpp] == data[i + bpp * count:i + bpp * (count + 1)]
                and count < 255
            ):
                count += 1
            encoded.append(count)
            encoded.extend(chunk)
            i += bpp * count
        return encoded

    def encode(self, image_or_path, out_path, compression=COMPRESSION_RLE, alpha=ALPHA_DISABLED):
        if isinstance(image_or_path, Image.Image):
            img = image_or_path.convert("RGBA")
        else:
            img = Image.open(image_or_path).convert("RGBA")

        self.width, self.height = img.size
        bpp = 4 if alpha == self.ALPHA_ENABLED else 3

        raw = bytearray()
        if compression == self.COMPRESSION_RLE:
            for y in range(self.height):
                row = bytearray()
                for x in range(self.width):
                    r, g, b, a = img.getpixel((x, y))
                    row.extend([r, g, b, a] if bpp == 4 else [r, g, b])
                encoded_row = self._rle_encode(row, bpp)
                raw.extend(len(encoded_row).to_bytes(2, "big"))
                raw.extend(encoded_row)

        elif compression == self.COMPRESSION_ZLIB:
            for y in range(self.height):
                for x in range(self.width):
                    r, g, b, a = img.getpixel((x, y))
                    raw.extend([r, g, b, a] if bpp == 4 else [r, g, b])
            raw = zlib.compress(raw, level=9)
        
        elif compression == self.COMPRESSION_RLE_ZLIB:
            rle_data = bytearray()
            for y in range(self.height):
                row = bytearray()
                for x in range(self.width):
                    r, g, b, a = img.getpixel((x, y))
                    row.extend([r, g, b, a] if bpp == 4 else [r, g, b])
                encoded_row = self._rle_encode(row, bpp)
                rle_data.extend(len(encoded_row).to_bytes(2, "big"))
                rle_data.extend(encoded_row)
        
            raw = zlib.compress(rle_data, level=9)

        elif compression == self.COMPRESSION_NONE:
            for y in range(self.height):
                row = bytearray()
                for x in range(self.width):
                    r, g, b, a = img.getpixel((x, y))
                    row.extend([r, g, b, a] if bpp == 4 else [r, g, b])
                raw.extend(len(row).to_bytes(2, "big"))
                raw.extend(row)

        else:
            raise ValueError("Unsupported compression type")

        with open(out_path, "wb") as f:
            f.write(self.HEADER_MAGIC)
            f.write(bytes([self.VERSION]))
            f.write(bytes([compression]))
            f.write(bytes([alpha]))
            f.write(self.width.to_bytes(2, "big"))
            f.write(self.height.to_bytes(2, "big"))
            f.write(bytes([0]))  # Reserved
            f.write(raw)

    def _rle_decode(self, data: bytes, bpp: int) -> bytearray:
        decoded = bytearray()
        i = 0
        while i < len(data):
            count = data[i]
            i += 1
            pixel = data[i:i+bpp]
            decoded.extend(pixel * count)
            i += bpp
        return decoded

    def decode(self, nvg_path, png_path=RETURN_IMAGE):
        with open(nvg_path, "rb") as f:
            header = f.read(11)
            if not header.startswith(self.HEADER_MAGIC):
                raise ValueError("Not a valid NVGIF file")

            version = header[3]
            if version != self.VERSION:
                raise ValueError(f"Unsupported NVGIF version: {version}")

            compression = header[4]
            alpha = header[5]
            self.width = int.from_bytes(header[6:8], "big")
            self.height = int.from_bytes(header[8:10], "big")
            bpp = 4 if alpha == self.ALPHA_ENABLED else 3
            data = f.read()

        pixels = bytearray()

        if compression == self.COMPRESSION_NONE or compression == self.COMPRESSION_RLE:
            i = 0
            for _ in range(self.height):
                row_len = int.from_bytes(data[i:i+2], "big")
                i += 2
                row_data = data[i:i+row_len]
                i += row_len

                if compression == self.COMPRESSION_RLE:
                    row = self._rle_decode(row_data, bpp)
                else:
                    row = row_data

                pixels.extend(row)

        elif compression == self.COMPRESSION_ZLIB:
            decompressed = zlib.decompress(data)
            pixels = decompressed
        
        elif compression == self.COMPRESSION_RLE_ZLIB:
            decompressed = zlib.decompress(data)
            i = 0
            for _ in range(self.height):
                row_len = int.from_bytes(decompressed[i:i+2], "big")
                i += 2
                row_data = decompressed[i:i+row_len]
                i += row_len
                row = self._rle_decode(row_data, bpp)
                pixels.extend(row)

        else:
            raise ValueError("Unknown compression type")

        mode = "RGBA" if alpha == self.ALPHA_ENABLED else "RGB"
        out = Image.frombytes(mode, (self.width, self.height), bytes(pixels))
        if png_path == self.RETURN_IMAGE:
            return out
        else:
            out.save(png_path)