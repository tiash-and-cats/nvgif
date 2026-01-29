from PIL import Image

class NVGIFv3:
    HEADER_MAGIC = b"NVG"
    VERSION = 3
    COMPRESSION_NONE = 0
    COMPRESSION_RLE = 1
    ALPHA_DISABLED = 0
    ALPHA_ENABLED = 1
    RETURN_IMAGE = 1

    def __init__(self, width=None, height=None):
        self.width = width
        self.height = height

    def encode(self, png_path, nvg_path, compression=COMPRESSION_RLE, alpha=ALPHA_DISABLED):
        if isinstance(png_path, Image.Image):
            img = png_path
        else:
            img = Image.open(png_path).convert("RGBA")
            
        self.width, self.height = img.size

        with open(nvg_path, "wb") as f:
            f.write(self.HEADER_MAGIC)
            f.write(bytes([self.VERSION]))
            f.write(bytes([compression]))
            f.write(bytes([alpha]))
            f.write(self.width.to_bytes(2, "big"))
            f.write(self.height.to_bytes(2, "big"))

            bpp = 4 if alpha == self.ALPHA_ENABLED else 3

            for y in range(self.height):
                row = bytearray()
                for x in range(self.width):
                    r, g, b, a = img.getpixel((x, y))
                    row.extend([r, g, b, a] if bpp == 4 else [r, g, b])

                if compression == self.COMPRESSION_RLE:
                    compressed = self._rle_encode(row, bpp)
                    f.write(len(compressed).to_bytes(2, "big"))
                    f.write(compressed)
                else:
                    f.write(len(row).to_bytes(2, "big"))
                    f.write(row)

    def decode(self, nvg_path, png_path=RETURN_IMAGE):
        with open(nvg_path, "rb") as f:
            data = f.read()

        if not data.startswith(self.HEADER_MAGIC):
            raise ValueError("Not a valid NVGIF file")
        version = data[3]
        compression = data[4]
        alpha = data[5]
        self.width = int.from_bytes(data[6:8], "big")
        self.height = int.from_bytes(data[8:10], "big")

        bpp = 4 if alpha == self.ALPHA_ENABLED else 3
        offset = 10
        img = Image.new("RGBA", (self.width, self.height))

        for y in range(self.height):
            row_len = int.from_bytes(data[offset:offset+2], "big")
            offset += 2
            raw = data[offset:offset + row_len]
            offset += row_len

            row = self._rle_decode(raw, bpp) if compression == self.COMPRESSION_RLE else raw
            for x in range(self.width):
                i = x * bpp
                if bpp == 4:
                    r, g, b, a = row[i:i+4]
                else:
                    r, g, b = row[i:i+3]
                    a = 255
                img.putpixel((x, y), (r, g, b, a))
        if png_path != self.RETURN_IMAGE:
            img.save(png_path)
        else:
            return img

    def _rle_encode(self, row, bpp):
        result = bytearray()
        i = 0
        while i < len(row):
            unit = row[i:i+bpp]
            count = 1
            while (i + count * bpp < len(row)) and (count < 255) and (row[i + count * bpp:i + (count+1) * bpp] == unit):
                count += 1
            result.append(count)
            result += unit
            i += count * bpp
        return result

    def _rle_decode(self, data, bpp):
        result = bytearray()
        i = 0
        while i < len(data):
            count = data[i]
            unit = data[i+1:i+1+bpp]
            result.extend(unit * count)
            i += 1 + bpp
        return result