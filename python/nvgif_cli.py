import argparse
from nvgif import NVGIF
from nvgif_v2 import NVGIFv2
from nvgif_v3 import NVGIFv3
from nvgif_v4 import NVGIFv4
from PIL import Image, ImageTk
import tkinter as tk

def make_checker(size, square=8, c1=(192, 192, 192), c2=(255, 255, 255)):
    bg = Image.new("RGB", size, c1)
    for y in range(0, size[1], square):
        for x in range(0, size[0], square):
            if (x // square + y // square) % 2 == 0:
                for i in range(square):
                    for j in range(square):
                        if x + i < size[0] and y + j < size[1]:
                            bg.putpixel((x + i, y + j), c2)
    return bg

def view_image(img, title="Viewer"):
    w, h = img.size
    win = tk.Tk()
    win.title(title)
    sw, sh = win.winfo_screenwidth(), win.winfo_screenheight()
    scale = min(1, (sw * 0.9) / w, (sh * 0.9) / h)
    size = int(w * scale), int(h * scale)

    canvas = tk.Canvas(win, width=size[0], height=size[1], bg="#888")
    canvas.pack(fill="both", expand=True)
    checker = make_checker(size)
    img = img.convert("RGBA").resize(size, Image.LANCZOS)
    composite = Image.alpha_composite(checker.convert("RGBA"), img)
    tk_img = ImageTk.PhotoImage(composite)
    canvas.create_image(size[0] // 2, size[1] // 2, anchor="center", image=tk_img)
    win.mainloop()

def main():
    parser = argparse.ArgumentParser(
        prog="nvgif",
        description="Not Very Good Image Format CLI"
    )
    sub = parser.add_subparsers(dest="command", required=True)

    encode = sub.add_parser("encode", help="Encode PNG to NVGIF")
    encode.add_argument("input", help="Input image file (.png/.jpeg/.bmp/etc.)")
    encode.add_argument("output", help="Output file (.nvg)")
    encode.add_argument("--version", type=int, choices=[1, 2, 3, 4], default=4, help="NVGIF version (default: 4)")
    encode.add_argument("--compression", choices=["none", "rle", "zlib", "rlezlib"], help="Compression for NVGIF")
    encode.add_argument("--alpha", action="store_true", help="Enable alpha (NVGIF v3+ only)")

    decode = sub.add_parser("decode", help="Convert NVGIF to PNG")
    decode.add_argument("input", help="Input .nvg file")
    decode.add_argument("output", help="Output file (.png)")

    info = sub.add_parser("info", help="Display basic header info from a NVGIF file")
    info.add_argument("input", help="Input image file (.nvg)")

    view = sub.add_parser("view", help="View a still NVGIF")
    view.add_argument("input", help="Input .nvg file")

    args = parser.parse_args()
    nv = NVGIF()

    if args.command == "encode":        if args.compression is None:            args.compression = NVGIF.DEFAULT_COMPRESSIONS[args.version]        c_map = {            2: {"none": NVGIFv2.COMPRESSION_NONE, "rle": NVGIFv2.COMPRESSION_RLE},            3: {"none": NVGIFv3.COMPRESSION_NONE, "rle": NVGIFv3.COMPRESSION_RLE},            4: {                "none": NVGIFv4.COMPRESSION_NONE,                "rle": NVGIFv4.COMPRESSION_RLE,                "zlib": NVGIFv4.COMPRESSION_ZLIB,                "rlezlib": NVGIFv4.COMPRESSION_RLE_ZLIB,            },        }        a_map = {            3: lambda: NVGIFv3.ALPHA_ENABLED if args.alpha else NVGIFv3.ALPHA_DISABLED,            4: lambda: NVGIFv4.ALPHA_ENABLED if args.alpha else NVGIFv4.ALPHA_DISABLED,        }        kwargs = {}        if args.version in c_map:            kwargs["compression"] = c_map[args.version].get(args.compression)        if args.version in a_map:            kwargs["alpha"] = a_map[args.version]()        nv.encode(args.input, args.output, version=args.version, **kwargs)        print(f"✓ Encoded NVGIF v{args.version}: {args.input} → {args.output}")

    elif args.command == "decode":
        nv.decode(args.input, args.output)
        print(f"✓ Decoded NVGIF: {args.input} → {args.output}")

    elif args.command == "info":        with open(args.input, "rb") as f:            hdr = f.read(11)        ver = hdr[3]        if ver == 1:            w = int.from_bytes(hdr[4:6], "big")            h = int.from_bytes(hdr[6:8], "big")            print(f"NVGIF v1 — {w}×{h}")        elif ver in (2, 3, 4):            c = {
                0: "None",
                1: "RLE",
                2: "Zlib",
                3: "RLE+Zlib",
            }[hdr[4]]            a = hdr[5] if ver >= 3 else None            w = int.from_bytes(hdr[6:8], "big")            h = int.from_bytes(hdr[8:10], "big")            print(f"NVGIF v{ver} — {w}×{h}, compression={c}, alpha={a and "Yes" or "No"}")        else:            print("✗ Unsupported NVGIF version")

    elif args.command == "view":        img = nv.decode(args.input)        view_image(img, f"NVGIF — {args.input}")

if __name__ == "__main__":
    main()
