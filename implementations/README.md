# NVGIF Implementations

## Introduction

The GitHub repository provides reference implementations in Python, C#, JavaScript, and C.
- **Python** → full encoder/decoder support for NVGIF v1–v5, with Pillow integration.
- **C#** → lightweight, Windows-specific decoder for NVGIF v1–v4 using `System.Drawing.Common`.
- **JavaScript** → browser‑ready decoder that integrates with the DOM via `MutationObserver`.
- **C** → simple, portable decoder for v1 and v2, easily integrated into libraries like OpenCV.

Together, these implementations make NVGIF portable across platforms and languages, while keeping the format's playful spirit alive.

## Python

The Python implementation of NVGIF requires Pillow. It supports all NVGIF versions (v1-v6). An NVGIF plugin for Pillow is included ([`python/NvgifImagePlugin.py`](https://github.com/tiash-and-cats/nvgif/tree/master/python/NvgifImagePlugin.py)). To use it, simply import it (with `nvgif.py` and all the `nvgif_v1-5.py` files in the same directory) and open an NVGIF of your choice.

### `nvgif_v1.NVGIFv1` objects

#### `class nvgif_v1.NVGIFv1:`
> An NVGIF v1 encoder and decoder.
>
> `HEADER_MAGIC = b"NVG"`
> > The magic number for NVGIF files.
>
> `VERSION = 1`
> > The NVGIF version the decoder decodes.

#### `NVGIFv1.encode(png_path: str | PIL.Image.Image, nvg_path: str) -> None:`
> Takes the image at `png_path` and encodes it into an NVGIFv1 at `nvg_path`.

#### `NVGIFv1.decode(nvg_path: str[, png_path: str]) -> PIL.Image.Image | None:`
> Takes the NVGIFv1 at `nvg_path` and decodes it into an image at `png_path`. If `png_path` is not given, returns the decoded `PIL.Image.Image`.

### `nvgif_v2.NVGIFv2` objects

#### `class nvgif_v2.NVGIFv2:`
> An NVGIF v2 encoder and decoder.
>
> `HEADER_MAGIC = b"NVG"`
> > The magic number for NVGIF files.
>
> `VERSION = 2`
> > The NVGIF version the decoder decodes.
>
> `COMPRESSION_NONE = 0`
> > No compression.
>
> `COMPRESSION_RLE = 1`
> > RLE compression.

#### `NVGIFv2.encode(png_path: str | PIL.Image.Image, nvg_path: str, compression: int=COMPRESSION_RLE) -> None:`
> Takes the image at `png_path` and encodes it into an NVGIFv2 at `nvg_path` using `compression`.

#### `NVGIFv2.decode(nvg_path: str[, png_path: str]) -> PIL.Image.Image | None:`
> Takes the NVGIFv2 at `nvg_path` and decodes it into an image at `png_path`. If `png_path` is not given, returns the decoded `PIL.Image.Image`.

### `nvgif_v3.NVGIFv3` objects

#### `class nvgif_v3.NVGIFv3:`
> An NVGIF v3 encoder and decoder.
>
> `HEADER_MAGIC = b"NVG"`
> > The magic number for NVGIF files.
>
> `VERSION = 3`
> > The NVGIF version the decoder decodes.
>
> `COMPRESSION_NONE = 0`
> > No compression.
>
> `COMPRESSION_RLE = 1`
> > RLE compression.
>
> `ALPHA_DISABLED = 0`
> > RGB pixels.
>
> `ALPHA_ENABLED = 1`
> > RGBA pixels.

#### `NVGIFv3.encode(png_path: str | PIL.Image.Image, nvg_path: str, compression: int=COMPRESSION_RLE, alpha=ALPHA_DISABLED) -> None:`
> Takes the image at `png_path` and encodes it into an NVGIFv3 at `nvg_path` with `alpha` using `compression`.

#### `NVGIFv3.decode(nvg_path: str[, png_path: str]) -> PIL.Image.Image | None:`
> Takes the NVGIFv3 at `nvg_path` and decodes it into an image at `png_path`. If `png_path` is not given, returns the decoded `PIL.Image.Image`.

### `nvgif_v4.NVGIFv4` objects

#### `class nvgif_v4.NVGIFv4:`
> An NVGIF v4 encoder and decoder.
>
> `HEADER_MAGIC = b"NVG"`
> > The magic number for NVGIF files.
>
> `VERSION = 4`
> > The NVGIF version the decoder decodes.
>
> `COMPRESSION_NONE = 0`
> > No compression.
>
> `COMPRESSION_RLE = 1`
> > RLE compression.
>
> `COMPRESSION_ZLIB = 2`
> > Zlib compression.
>
> `COMPRESSION_RLE_ZLIB = 3`
> > RLE *and* Zlib compression. See spec for details.
>
> `ALPHA_DISABLED = 0`
> > RGB pixels.
>
> `ALPHA_ENABLED = 1`
> > RGBA pixels.

#### `NVGIFv4.encode(png_path: str | PIL.Image.Image, nvg_path: str, compression: int=COMPRESSION_RLE_ZLIB, alpha=ALPHA_DISABLED) -> None:`
> Takes the image at `png_path` and encodes it into an NVGIFv4 at `nvg_path` with `alpha` using `compression`.

#### `NVGIFv4.decode(nvg_path: str[, png_path: str]) -> PIL.Image.Image | None:`
> Takes the NVGIFv4 at `nvg_path` and decodes it into an image at `png_path`. If `png_path` is not given, returns the decoded `PIL.Image.Image`.

### `nvgif_v5.NVGIFv5` objects

#### `class nvgif_v5.NVGIFv5:`
> An NVGIFv5 encoder and decoder.
>
> `HEADER_MAGIC = b"NVG"`
> > The magic number for NVGIF files.
>
> `VERSION = 5`
> > The NVGIF version the decoder decodes.
>

#### `class NVGIFv5.CompressionType:`
> An [IntFlag enum](https://docs.python.org/3/library/enum.html#enum.IntFlag) that represents compression types.
> >
> `NONE = 0`
> > No compression.
>
> `RLE = 1`
> > RLE compression.
>
> `ZLIB = 2`
> > Zlib compression.
>
> `RGB565 = 4`
> > RGB565 encoding as rudimentary compression.

#### `NVGIFv5.encode(png_path: str | PIL.Image.Image, nvg_path: str, compression: int | CompressionType=NVGIFv5.CompressionType.RLE | NVGIFv5.CompressionType.ZLIB, alpha=False) -> None:`
> Takes the image at `png_path` and encodes it into an NVGIFv5 at `nvg_path` with `alpha` using `compression`.
> > **NOTE:** Alpha cannot be used with RGB565 encoding. Doing so will emit a [`UserWarning`](https://docs.python.org/3/library/exceptions.html#UserWarning) and alpha will not be enabled.

#### `NVGIFv5.decode(nvg_path: str[, png_path: str]) -> PIL.Image.Image | None:`
> Takes the NVGIFv5 at `nvg_path` and decodes it into an image at `png_path`. If `png_path` is not given, returns the decoded `PIL.Image.Image`.

### `nvgif.NVGIF` objects

#### `class nvgif.NVGIF:`
> An NVGIF encoder and decoder wrapper that wraps `nvgif_v1.NVGIFv1` to `nvgif_v5.NVGIFv5`.
>
> `DEFAULT_COMPRESSIONS`
> > A dictionary mapping versions to their default compression.

#### `NVGIF.encode(image: str | PIL.Image.Image, out_path: str, version=4, compression=None, alpha=0) -> None:`
> Takes the image at `image` and encodes it into an NVGIF with version `version` at `out_path`. If `compression` is not given, it is set to `NVGIF.DEFAULT_COMPRESSIONS[version]`.

#### `NVGIF.decode(in_path: str[, out_path: str]) -> PIL.Image.Image | None:`
> Takes the NVGIF at `in_path` and decodes it into an image at `out_path`. If `out_path` is not given, returns the decoded `PIL.Image.Image`.

### Examples
Encode and decode images:
``` python
from PIL import Image
from nvgif import NVGIF

# Encode a PNG into NVGIF v5
img = Image.open("input.png").convert("RGBA")
nvg = NVGIF()
nvg.encode(img, "output.nvg", version=5, compression=["rle","zlib"], alpha=1)

# Decode back into Pillow
decoded = nvg.decode("output.nvg")
decoded.show()
```
This can be rewritten using the `NvgifImagePlugin`, which allows for seamless integration with Pillow:
``` python
from PIL import Image
import NvgifImagePlugin

# Open an NVGIF file directly
img = Image.open("example.nvg")
img.show()

# Save an image as NVGIF v5 with RLE+Zlib compression
img = Image.open("input.png").convert("RGBA")
img.save("output.nvg", format="NVGIF", version=5, compression=["rle","zlib"])
```

## C#

The C# implementation of NVGIF requires `System.Drawing.Common`. As such, it is Windows-specific. It supports v1-v4, and it can only decode NVGIF files as of now. Example in [`csharp/NVGIFTest.cs`](https://github.com/tiash-and-cats/nvgif/tree/master/csharp).

### `public static class NVGIF.NVGIF`
> An NVGIF decoder. Supports v1-4.

### `public enum NVGIF.NVGIF.CompressionType : byte`
> An enum of compression types.
>
> `None = 0`
> > No compression.
>
> `RLE = 1`
> > RLE compression.
>
> `Zlib = 2`
> > Zlib compression.
>
> `RLE_Zlib = 3`
> > RLE *and* Zlib compression. See spec for details.

### `public static Bitmap NVGIF.NVGIF.Decode(byte[] nvgData)`
> Decode an NVGIF buffer (v1..v4) and return a Bitmap.

## JavaScript

> **Note:** Types are given for illustration purposes only, the implementation itself is not written in TypeScript, but rather JavaScript.

The JavaScript implementation of NVGIF uses pako via jsDelivr. It uses a `MutationObserver` to look for changes in the DOM. When it detects one, it will sweep through all undecoded NVGIFs in the page and decode them. It supports `<img>` and `<picture>`. It supports NVGIFv1-v5 (decode-only).

### `async globalThis.loadNVGIF(src: string): OffscreenCanvas`
> Decodes the NVGIF at the URL `src` and returns the image data in the form of an [`OffscreenCanvas`](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas).

### `class globalThis.NVGIFImage(src: string)`
> This class tries to mimic the behavior of `Image`. When it is created, it starts loading the image at `src`. If the load succeeds, calls `onload` with no arguments and sets `imgData` to an `ImageData` object with the decoded data. If the load fails, calls `onerror` with no arguments.
>
> `onload: () => void`
> > A callback called upon a successful load.
>
> `onerror: () => void`
> > A callback called upon a failed load.
>
> <code>imgData: <a href="https://developer.mozilla.org/en-US/docs/Web/API/ImageData">ImageData</a> | null</code>
> > If the load was successful, is an [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) object with decoded image data, otherwise `null`.
>
> <code>canvas: <a href="https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas">OffscreenCanvas</a> | null</code>
> > If the load was successful, is an [`OffscreenCanvas`](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) object with decoded image data on it's surface, otherwise `null`.

## C

The C implementation of NVGIF was tested with TCC 0.9.27 and MSVC++ 19.50.35727 for x64. It only supports v1-v3 decoding right now. To use it, download the files and link against `nvgif.c`, and include the header file `nvgif.h`. It has been tested with `lodepng` (C) and OpenCV (C++). Examples are in [`c/`](https://github.com/tiash-and-cats/nvgif/tree/master/c). 

> **WARNING:** This API is not thread-safe! If you want threads, you've got to synchronize it yourself.

### `typedef struct nvg_Image`
> A structure that represents a decoded NVGIF.
>
> `unsigned char *pixels`
> > A buffer that contains RGBA data.
>
> `int width`
> > The width of the image.
>
> `int height`
> > The height of the image.

### `nvg_Image* nvg_decode_image(const char *filename)`
> Decodes the NVGIF at `filename`. On success, returns a pointer to an `nvg_Image`. On failure, returns `NULL` and sets `nvg_error`.

### `void nvg_free_image(nvg_Image *img)`
> Frees the image at `img`. This must be called after you are done with image structs returned from `nvg_decode_image`.

### `char nvg_error[128]`
> A global buffer that contains the most recent error message.  
> It starts out empty, and when an error occurs a formatted string is written into this buffer using `vsnprintf`.  
> The message remains valid until the next error occurs, at which point the buffer is updated.  
> Messages longer than 127 characters are truncated to fit.  
> **This buffer is not thread-safe; concurrent calls may overwrite each other.**

### Important note for OpenCV
The `pixels` buffer in `nvg_Image` is **RGBA**.
OpenCV expects **BGRA** (or BGR) channel ordering.
To display or save correctly, convert after wrapping into a `cv::Mat`:

``` c++
cv::Mat rgba(img->height, img->width, CV_8UC4, img->pixels);
cv::Mat bgra;
cv::cvtColor(rgba, bgra, cv::COLOR_RGBA2BGRA);
```

Without this conversion, colors will appear swapped (e.g. red → blue).