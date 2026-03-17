from PIL import Image, ImageFile
from nvgif import NVGIF

def _open(fp, filename):
    decoder = NVGIF()
    img = decoder.decode(filename)
    return img

def _save(im, fp, filename, **params):
    version = params.get("version", 5)  # default to v5
    compression = params.get("compression", None)

    # Automatically decide alpha based on mode
    alpha = (im.mode == "RGBA")

    encoder = NVGIF()
    encoder.encode(im, filename, version=version, compression=compression, alpha=alpha)

Image.register_open("NVGIF", _open)
Image.register_save("NVGIF", _save)
Image.register_extension("NVGIF", ".nvg")
Image.register_extension("NVGIF", ".nvg1")
Image.register_extension("NVGIF", ".nvg2")
Image.register_extension("NVGIF", ".nvg3")
Image.register_extension("NVGIF", ".nvg4")
Image.register_extension("NVGIF", ".nvg5")