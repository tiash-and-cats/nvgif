from PIL import Image

class NVGIFv2:
    HEADER_MAGIC = b"NVG"
    VERSION = 2
    COMPRESSION_NONE = 0
    COMPRESSION_RLE = 1
    RETURN_IMAGE = 1

    def __init__(self, width=None, height=None):
        self.width = width
        self.height = height

    def encode(self, png_path, nvg_path, compression=COMPRESSION_RLE):
        if isinstance(png_path, Image.Image):
            img = png_path
        else:
            img = Image.open(png_path).convert("RGBA")
            
        img.load()
        self.width, self.height = img.size

        with open(nvg_path, "wb") as f:
            f.write(self.HEADER_MAGIC)
            f.write(bytes([self.VERSION]))
            f.write(bytes([compression]))
            f.write(self.width.to_bytes(2, "big"))
            f.write(self.height.to_bytes(2, "big"))

            for y in range(self.height):
                row = bytearray()
                for x in range(self.width):
                    r, g, b, *_ = img.getpixel((x, y))
                    row.extend([r, g, b])

                if compression == self.COMPRESSION_RLE:
                    compressed = self._rle_encode(row)
                    f.write(len(compressed).to_bytes(2, "big"))
                    f.write(compressed)
                else:
                    f.write(len(row).to_bytes(2, "big"))
                    f.write(row)

    def decode(self, nvg_path, png_path=RETURN_IMAGE):
        with open(nvg_path, "rb") as f:
            data = f.read()

        if not data.startswith(self.HEADER_MAGIC):
            raise ValueError("Invalid NVGIF file")
        version = data[3]
        if version != self.VERSION:
            raise ValueError(f"Wrong version: {version}")
        compression = data[4]
        self.width = int.from_bytes(data[5:7], "big")
        self.height = int.from_bytes(data[7:9], "big")

        offset = 9
        img = Image.new("RGBA", (self.width, self.height))

        for y in range(self.height):
            if offset + 2 > len(data):
                raise ValueError(f"Row {y}: missing length prefix")
            row_len = int.from_bytes(data[offset:offset + 2], "big")
            offset += 2
            raw = data[offset:offset + row_len]
            offset += row_len

            if compression == self.COMPRESSION_RLE:
                row = self._rle_decode(raw)
            else:
                row = raw

            if len(row) != self.width * 3:
                raise ValueError(f"Row {y} length mismatch: got {len(row)} bytes")

            for x in range(self.width):
                i = x * 3
                r, g, b = row[i:i+3]
                img.putpixel((x, y), (r, g, b, 255))
                
        if png_path != self.RETURN_IMAGE:
            img.save(png_path)
        else:
            return img

    def _rle_encode(self, row):
        result = bytearray()
        i = 0
        while i < len(row):
            rgb = row[i:i+3]
            count = 1
            while (i + count*3 < len(row)) and (count < 255) and (row[i + count*3:i + (count+1)*3] == rgb):
                count += 1
            result.append(count)
            result += rgb
            i += 3 * count
        return result

    def _rle_decode(self, data):
        result = bytearray()
        i = 0
        while i < len(data):
            count = data[i]
            rgb = data[i+1:i+4]
            result.extend(rgb * count)
            i += 4
        return result