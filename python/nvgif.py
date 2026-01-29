from nvgif_v1 import NVGIFv1
from nvgif_v2 import NVGIFv2
from nvgif_v3 import NVGIFv3
from nvgif_v4 import NVGIFv4

class NVGIF:
    DEFAULT_COMPRESSIONS = {
        1: "none",
        2: "rle",
        3: "rle",
        4: "rlezlib"
    }
    
    def __init__(self):
        self.versions = {
            1: NVGIFv1(),
            2: NVGIFv2(),
            3: NVGIFv3(),
            4: NVGIFv4(),
        }

    def encode(self, image, out_path, version=4, compression=None, alpha=0):
        if version not in self.versions:
            raise ValueError(f"Unsupported NVGIF version: {version}")
        
        if version == 1:
            self.versions[version].encode(image, out_path)
            return
            
        if compression is None:
            compression = self.DEFAULT_COMPRESSIONS[version]
        
        # Map string compression values to version-specific constants
        compression_map = {
            2: {"rle": NVGIFv2.COMPRESSION_RLE, "none": NVGIFv2.COMPRESSION_NONE},
            3: {"rle": NVGIFv3.COMPRESSION_RLE, "none": NVGIFv3.COMPRESSION_NONE},
            4: {
                "rle": NVGIFv4.COMPRESSION_RLE,
                "none": NVGIFv4.COMPRESSION_NONE,
                "zlib": NVGIFv4.COMPRESSION_ZLIB,
                "rlezlib": NVGIFv4.COMPRESSION_RLE_ZLIB,
            },
        }
        
        if isinstance(compression, str):
            try:
                compression = compression_map[version][compression]
            except (KeyError, TypeError):
                raise ValueError(f"Unsupported compression '{compression}' for NVGIFv{version}")
                
        self.versions[version].encode(image, out_path, compression=compression, alpha=alpha)

    def decode(self, in_path, out_path=None): 
        with open(in_path, "rb") as f:
            header = f.read(4)
            if not header.startswith(b"NVG"):
                raise ValueError("Not a valid NVGIF file")
            version = header[3]

        if version not in self.versions:
            raise ValueError(f"Unsupported NVGIF version: {version}")

        decoder = self.versions[version]
        if version == 4:
            return decoder.decode(in_path, out_path or decoder.RETURN_IMAGE)
        else:
            return decoder.decode(in_path)