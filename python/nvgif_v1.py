from PIL import Image

class NVGIFv1:
    HEADER_MAGIC = b"NVG"
    VERSION = 1
    RETURN_IMAGE = 1

    def __init__(self, width=None, height=None):
        self.width = width
        self.height = height

    def encode(self, png_path, nvg_path):
        if isinstance(png_path, Image.Image):
            png = png_path
        else:
            png = Image.open(png_path).convert("RGBA")
            
        png.load()
        self.width, self.height = png.size

        with open(nvg_path, "wb") as f:
            f.write(self.HEADER_MAGIC)
            f.write(bytes([self.VERSION]))
            f.write(self.width.to_bytes(2, "big"))
            f.write(self.height.to_bytes(2, "big"))

            for y in range(self.height):
                row = bytearray()
                for x in range(self.width):
                    r, g, b, *_ = png.getpixel((x, y))
                    row.extend([r, g, b])
                f.write(len(row).to_bytes(2, "big"))
                f.write(row)

    def decode(self, nvg_path, png_path=RETURN_IMAGE):
        with open(nvg_path, "rb") as f:
            data = f.read()

        if not data.startswith(self.HEADER_MAGIC):
            raise ValueError("Not a valid NVGIF file")
        version = data[3]
        if version != self.VERSION:
            raise ValueError(f"Unsupported NVGIF version: {version}")

        self.width = int.from_bytes(data[4:6], "big")
        self.height = int.from_bytes(data[6:8], "big")
        offset = 8

        png = Image.new("RGBA", (self.width, self.height))
        for y in range(self.height):
            if offset + 2 > len(data):
                raise ValueError(f"Row {y}: missing length prefix")
            row_len = int.from_bytes(data[offset:offset+2], "big")
            offset += 2
            if offset + row_len > len(data):
                raise ValueError(f"Row {y}: truncated row")
            row = data[offset:offset+row_len]
            offset += row_len
            if row_len != self.width * 3:
                raise ValueError(f"Row {y} length mismatch: {row_len} vs expected {self.width * 3}")
            for x in range(self.width):
                i = x * 3
                r, g, b = row[i:i+3]
                png.putpixel((x, y), (r, g, b, 255))
                
        if png_path != self.RETURN_IMAGE:
            png.save(png_path)
        else:
            return png