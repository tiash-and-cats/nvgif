![NVGIF logo](logo.png)

# This is version 6 of the Not Very Good Image Format 

NVGIF is a tiny, simple image format designed for fun, experimentation, and learning. Despite its tongue‑in‑cheek name, NVGIF is only slightly larger than PNG on average, and it comes with clear specs and **4(!)** reference implementations. As it has so many implementations, that basically proves it's a standard.

Version 6 introduces simple CRC32 error checking to NVGIF.

## How do I use this repo?

The [GitHub repo](https://github.com/tiash-and-cats/nvgif/) isn't really meant to be cloned. Cloning is only required if you want to contribute. Instead, view files and download individual files (or folders using [download-directory.github.io](https://download-directory.github.io/)).

## File Extensions and Mimetype

The MIME type of NVGIF files is `image/x-nvgif`.

| Extension | Versions Supported | Notes |
|-----------|--------------------|-------|
| `.nvg`    | v1–v6              | General extension, recommended for everyday use |
| `.nvg1`   | v1                 | Explicit version marker (optional) |
| `.nvg2`   | v2                 | Explicit version marker (optional) |
| `.nvg3`   | v3                 | Explicit version marker (optional) |
| `.nvg4`   | v4                 | Explicit version marker (optional) |
| `.nvg5`   | v5                 | Explicit version marker (optional) |
| `.nvg6`   | v6                 | Explicit version marker (optional) |

> **NOTE:** None of the reference decoders really care about the file extension, so it's more of a human thing.

## Reference Implementations

The Github repo contains 4 reference implementations of NVGIF:

- **Python ([`/python`](https://github.com/tiash-and-cats/nvgif/tree/master/python)):**
  Requires `pillow`. Provides an `NVGIF` class with `.encode` and `.decode` methods.  
  Supports all versions (v1-v6). There is an NVGIF plugin for Pillow. Just import it (with all the other files in the same directory) and you'll be able to open NVGIF files with Pillow!

- **JavaScript ([`/nvgif.js`](https://github.com/tiash-and-cats/nvgif/blob/master/nvgif.js)):**
  Browser decoder. Finds `<img>` and `<picture>` elements with NVGIF sources and replaces them with decoded PNGs via [Blob URIs](https://en.wikipedia.org/wiki/Blob_URI_scheme). Also has an `NVGIFImage` with `.onload` and `.onerror` so that you can draw images onto a canvas.
  Supports all versions (v1-v6, decode-only). Uses [`pako`](https://github.com/nodeca/pako) via jsDelivr for v4 compression. It also has a more modern promise-based loader. Example in [`nvgifjstest.html`](nvgifjstest.html).

- **C# ([`/csharp`](https://github.com/tiash-and-cats/nvgif/tree/master/csharp)):**
  Requires `System.Drawing.Common`. As such, it is Windows-specific. Provides an `NVGIF` class with `.Decode` method.  
  Supports v1-v4 (decode-only). Example in [`csharp/NVGIFTest.cs`](https://github.com/tiash-and-cats/nvgif/tree/master/csharp).
  
- **C ([`/c`](https://github.com/tiash-and-cats/nvgif/tree/master/c)):**
  Provides an `nvg_decode_image` function and uses `nvg_error` for errors. Supports v1-v3 (decode-only). Tested with TCC and lodepng, and MSVC and OpenCV. Examples in [`c/`](https://github.com/tiash-and-cats/nvgif/tree/master/c/).
  
There is also one binding for NVGIF:

- **Java ([`c/java`](https://github.com/tiash-and-cats/nvgif/tree/master/c/java)):**
  Has an `nvgif.NVGIFDecoder` class with `decode` method. It is a binding for the C implementation. Examples in [`c/java/`](https://github.com/tiash-and-cats/nvgif/tree/master/c/java/).

Detailed API docs are in [NVGIF Implementations](implementations/).

## Specification

The specification can be found [here](specs/). It used to be at https://tiashdev.github.io/tiashfam-resources/nvgif/specs/.

## NVGIF CLI Tool

A standalone NVGIF encoder/decoder is available as a command-line utility. It supports version-aware encoding, decoding, and header inspection across all NVGIF versions.

It is located in the `python/` directory in the Github repo as [`nvgif_cli.py`](https://github.com/tiash-and-cats/nvgif/tree/master/python/nvgif_cli.py). As it uses the Python implementation of NVGIF, it needs Pillow to function. You need Python >=3.12 to run it.

This tool is ideal for scripting, testing, or integrating NVGIF into your own pipelines.

### Example Usage

Encode a PNG file into NVGIF v4:
```bash
python nvgif_cli.py encode input.png output.nvg --version 4
```

Convert an `.nvg` file back into a standard PNG:
```bash
python nvgif_cli.py decode input.nvg output.png
```

Display an NVGIF file's header and metadata:
```bash
python nvgif_cli.py info input.nvg
```

View an NVGIF image in a resizable window:
```bash
python nvgif_cli.py view image.nvg
```
> Launches a graphical window with the image rendered over a checkerboard background (for transparency). Handy for previewing `.nvg` files without converting to PNG.

For more options, run:
```bash
python nvgif_cli.py --help
```