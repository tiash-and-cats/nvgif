"""
NVGIF Python implementation
Copyright (c) tiash-and-cats & contributors
The NVGIF docs & reference implementations are licensed under the MIT License.
In practice this means you can use this code in your projects without paying
any kind of fee or subscription.

This is an NVGIF plugin for Pillow. It needs nvgif.py, which needs nvgif_v1.py through
nvgif_v5.py.
"""
from PIL import Image, ImageFile
from nvgif import NVGIF

def _open(fp, filename):
    # Peek at the first 3 bytes to confirm NVGIF magic
    header = fp.read(3)
    fp.seek(0)  # reset file pointer
    if header != b"NVG":
        raise SyntaxError("Not an NVGIF file")  # Pillow will try other plugins

    decoder = NVGIF()
    img = decoder.decode(filename)
    return img

def _save(im, fp, filename, **params):
    version = params.get("version", 5)  # default to v5
    compression = params.get("compression", None)
    alpha = (im.mode == "RGBA")

    encoder = NVGIF()
    encoder.encode(im, filename, version=version, compression=compression, alpha=alpha)

# Register NVGIF format explicitly
Image.register_open("NVGIF", _open)
Image.register_save("NVGIF", _save)
Image.register_extension("NVGIF", ".nvg")
Image.register_extension("NVGIF", ".nvg1")
Image.register_extension("NVGIF", ".nvg2")
Image.register_extension("NVGIF", ".nvg3")
Image.register_extension("NVGIF", ".nvg4")
Image.register_extension("NVGIF", ".nvg5")