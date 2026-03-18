"""
NVGIF Python implementation
Copyright (c) tiash-and-cats & contributors
The NVGIF docs & reference implementations are licensed under the MIT License.
In practice this means you can use this code in your projects without paying
any kind of fee or subscription.

This file contains a class NVGIF which is a wrapper for nvgif_v1.NVGIFv1
through nvgif_v5.NVGIFv5.
"""
from nvgif_v1 import NVGIFv1
from nvgif_v2 import NVGIFv2
from nvgif_v3 import NVGIFv3
from nvgif_v4 import NVGIFv4
from nvgif_v5 import NVGIFv5

class NVGIF:
    DEFAULT_COMPRESSIONS = {
        1: ["none"],
        2: ["rle"],
        3: ["rle"],
        4: ["rlezlib"],
        5: ["rle", "zlib"]
    }
    
    def __init__(self):
        self.versions = {
            1: NVGIFv1(),
            2: NVGIFv2(),
            3: NVGIFv3(),
            4: NVGIFv4(),
            5: NVGIFv5()
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
            5: {
                "none": NVGIFv5.CompressionType.NONE,
                "rle": NVGIFv5.CompressionType.RLE,
                "zlib": NVGIFv5.CompressionType.ZLIB,
                "rgb565": NVGIFv5.CompressionType.RGB565,
            }
        }
        
        if isinstance(compression, list):
            try:
                compression_num = 0
                for c in compression:
                    compression_num |= compression_map[version][c]
                compression = compression_num
            except (KeyError, TypeError):
                raise ValueError(f"Unsupported compression '{compression}' for NVGIFv{version}")
                
        if version >= 3:
            self.versions[version].encode(image, out_path, compression=compression, alpha=alpha)
        elif version == 2:
            self.versions[version].encode(image, out_path, compression=compression)
        elif version == 1:
            self.versions[version].encode(image, out_path)

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