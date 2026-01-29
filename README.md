# This is version 4 of the Not Very Good Image Format 

The Not Very Good Image Format is a tiny, simple image format but only a bit larger than PNG on average!

- Mimetype (I just made it up): `image/x-nvgif`
- Extension: `.nvg, .nvg1, .nvg2, .nvg3, .nvg4`

## Reference Implementations

The Github repo contains 3 reference implementations of NVGIF:

- **Python (`python/`)**: Requires `pillow`. Provides an `NVGIF` class with `.encode` and `.decode` methods. Supports all versions (v1–v4).
- **JavaScript (`nvgif.js`)**: Browser decoder. Finds `<img>` elements with NVGIF sources and replaces them with decoded PNGs via [Blob URIs](https://en.wikipedia.org/wiki/Blob_URI_scheme). Supports v1–v3 (decode‑only).
- **C# (`NVGIF.cs`)**: Provides an `NVGIF` class with `.Encode` and `.Decode` methods. Supports all versions (v1–v4).

## NVGIF CLI Tool

A standalone NVGIF encoder/decoder is available as a command-line utility. It supports version-aware encoding, decoding, and header inspection across all NVGIF versions.

It is located in the `python/` directory as `nvgif-cli.py`.

This tool is ideal for scripting, testing, or integrating NVGIF into your own pipelines.

### Example Usage

Encode a PNG file into NVGIF v4:
```batch
python nvgif-cli.py encode input.png output.nvg --version 4
```

Convert an `.nvg` file back into a standard PNG:
```batch
python nvgif-cli.py decode input.nvg output.png
```

Display an NVGIF file's header and metadata:
```batch
python nvgif-cli.py info input.nvg
```

View an NVGIF image in a resizable window:
```batch
python nvgif-cli.py view image.nvg
```
> Launches a graphical window with the image rendered over a checkerboard background (for transparency). Handy for previewing `.nvg` files without converting to PNG.

For more options, run:
```batch
python nvgif-cli.py --help
```

These examples assume you're running the CLI in the same directory as the executable. Adjust paths as needed!
