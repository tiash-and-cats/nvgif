# NVGIF Implementations

## Introduction

NVGIF is a modular image format designed to be both technically clear and creatively extensible.  
Each version builds on the same magic number (`NVG`) while introducing new features such as compression schemes and alpha channel support.  

The GitHub repository provides reference implementations in Python, C#, and JavaScript.  
- **Python** → full encoder/decoder support for NVGIF v1–v4, with Pillow integration.  
- **C#** → lightweight decoder for NVGIF v1–v4 using `System.Drawing.Common`.  
- **JavaScript** → browser‑ready decoder that integrates with the DOM via `MutationObserver`.  

Together, these implementations make NVGIF portable across platforms and languages, while keeping the format's playful spirit alive.

## Python

The Python implementation of NVGIF requires Pillow.

### `nvgif_v1.NVGIFv1` objects

> `class nvgif_v1.NVGIFv1:`  
> > An NVGIF v1 encoder and decoder.  
> > > `HEADER_MAGIC = b"NVG"`  
> > > > The magic number for NVGIF files.  
> > > `VERSION = 1`  
> > > > The NVGIF version the decoder decodes.  
> > > `def encode(png_path: str | PIL.Image.Image, nvg_path: str) -> None:`  
> > > > Takes the image at `png_path` and encodes it into an NVGIFv1 at `nvg_path`.  
> > > `def decode(nvg_path: str[, png_path: str]) -> PIL.Image.Image | None:`  
> > > > Takes the NVGIFv1 at `nvg_path` and decodes it into an image at `png_path`. If `png_path` is not given, returns the decoded `PIL.Image.Image`.

### `nvgif_v2.NVGIFv2` objects

> `class nvgif_v2.NVGIFv2:`  
> > An NVGIF v2 encoder and decoder.  
> > > `HEADER_MAGIC = b"NVG"`  
> > > > The magic number for NVGIF files.  
> > > `VERSION = 2`  
> > > > The NVGIF version the decoder decodes.  
> > > `COMPRESSION_NONE = 0`  
> > > > No compression.  
> > > `COMPRESSION_RLE = 1`  
> > > > RLE compression.  
> > > `def encode(png_path: str | PIL.Image.Image, nvg_path: str, compression=COMPRESSION_RLE) -> None:`  
> > > > Takes the image at `png_path` and encodes it into an NVGIFv2 at `nvg_path` using `compression`.  
> > > `def decode(nvg_path: str[, png_path: str]) -> PIL.Image.Image | None:`  
> > > > Takes the NVGIFv2 at `nvg_path` and decodes it into an image at `png_path`. If `png_path` is not given, returns the decoded `PIL.Image.Image`.

### `nvgif_v3.NVGIFv3` objects

> `class nvgif_v3.NVGIFv3:`  
> > An NVGIF v3 encoder and decoder.  
> > > `HEADER_MAGIC = b"NVG"`  
> > > > The magic number for NVGIF files.  
> > > `VERSION = 3`  
> > > > The NVGIF version the decoder decodes.  
> > > `COMPRESSION_NONE = 0`  
> > > > No compression.  
> > > `COMPRESSION_RLE = 1`  
> > > > RLE compression.  
> > > `ALPHA_DISABLED = 0`  
> > > > RGB pixels.  
> > > `ALPHA_ENABLED = 1`  
> > > > RGBA pixels.  
> > > `def encode(png_path: str | PIL.Image.Image, nvg_path: str, compression=COMPRESSION_RLE, alpha=ALPHA_DISABLED) -> None:`  
> > > > Takes the image at `png_path` and encodes it into an NVGIFv3 at `nvg_path` with `alpha` using `compression`.  
> > > `def decode(nvg_path: str[, png_path: str]) -> PIL.Image.Image | None:`  
> > > > Takes the NVGIFv3 at `nvg_path` and decodes it into an image at `png_path`. If `png_path` is not given, returns the decoded `PIL.Image.Image`.

### `nvgif_v4.NVGIFv4` objects

> `class nvgif_v4.NVGIFv4:`  
> > An NVGIF v4 encoder and decoder.  
> > > `HEADER_MAGIC = b"NVG"`  
> > > > The magic number for NVGIF files.  
> > > `VERSION = 4`  
> > > > The NVGIF version the decoder decodes.  
> > > `COMPRESSION_NONE = 0`  
> > > > No compression.  
> > > `COMPRESSION_RLE = 1`  
> > > > RLE compression.  
> > > `COMPRESSION_ZLIB = 2`  
> > > > Zlib compression.  
> > > `COMPRESSION_RLE_ZLIB = 3`  
> > > > RLE *and* Zlib compression. See spec for details.  
> > > `ALPHA_DISABLED = 0`  
> > > > RGB pixels.  
> > > `ALPHA_ENABLED = 1`  
> > > > RGBA pixels.  
> > > `def encode(png_path: str | PIL.Image.Image, nvg_path: str, compression=COMPRESSION_RLE_ZLIB, alpha=ALPHA_DISABLED) -> None:`  
> > > > Takes the image at `png_path` and encodes it into an NVGIFv4 at `nvg_path` with `alpha` using `compression`.  
> > > `def decode(nvg_path: str[, png_path: str]) -> PIL.Image.Image | None:`  
> > > > Takes the NVGIFv4 at `nvg_path` and decodes it into an image at `png_path`. If `png_path` is not given, returns the decoded `PIL.Image.Image`.

### `nvgif.NVGIF` objects

> `class nvgif.NVGIF:`  
> > An NVGIF encoder and decoder wrapper that wraps `nvgif_v1.NVGIFv1` to `nvgif_v4.NVGIFv4`.  
> > > `DEFAULT_COMPRESSIONS`  
> > > > A dictionary mapping versions to their default compression.  
> > > `def encode(self, image: str | PIL.Image.Image, out_path: str, version=4, compression=None, alpha=0) -> None:`  
> > > > Takes the image at `image` and encodes it into an NVGIF with version `verison` at `out_path`.  
> > > `def decode(self, in_path: str[, out_path: str]) -> PIL.Image.Image | None:`  
> > > > Takes the NVGIF at `in_path` and decodes it into an image at `out_path`. If `out_path` is not given, returns the decoded `PIL.Image.Image`.

## C#

The C# implementation of NVGIF requires `System.Drawing.Common`.

### namespace `NVGIF`

> `public static class NVGIF`  
> > An NVGIF decoder. Supports v1-4.  
> > > `public enum CompressionType : byte`  
> > > > An enum of compression types.  
> > > > > `None = 0`  
> > > > > > No compression.  
> > > > > `RLE = 1`  
> > > > > > RLE compression.  
> > > > > `Zlib = 2`  
> > > > > > Zlib compression.  
> > > > > `RLE_Zlib = 3`  
> > > > > > RLE *and* Zlib compression. See spec for details.    
> > > `public static Bitmap Decode(byte[] nvgData)`  
> > > > Decode an NVGIF buffer (v1..v4) and return a Bitmap.

## JavaScript

The JavaScript implementation of NVGIF uses pako via jsDelivr. It uses a `MutationObserver` to look for changes in the DOM. When it detects one, it will sweep through all undecoded NVGIFs in the page and decode them. It supports `<img>` and `<picture>`. It exposes one class:

> `class NVGIFImage(src)`  
> > An NVGIF decoder. Supports v1-4. It tries to mimic the behavior of `Image`. When it is created, it starts loading the image at `src`. If the load succeeds, calls `onload` with no arguments. If the load fails, calls `onerror` with no arguments.  
> > > `onload`  
> > > > A callback called upon a successful load.  
> > > `onerror`  
> > > > A callback called upon a failed load.  