import pako from "https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm";

const C_NONE = 0;
const C_RLE = 1;
const C_ZLIB = 2;
const C_RLEZLIB = 3;

function assert(condt, message) {
  if (!condt) {
    throw new Error(message);
  }
} 

function headerSizeForVersion(version) {
  switch (version) {
    case 1: return 8;
    case 2: return 9;
    case 3: return 10;
    case 4: return 11;
    default: throw new Error("Unsupported version");
  }
}

function rleDecode(data, bpp, expectedPixels) {
  const result = [];
  let i = 0, pixelsDecoded = 0;

  while (i < data.length && pixelsDecoded < expectedPixels) {
    const count = data[i];
    const unit = data.slice(i + 1, i + 1 + bpp);

    for (let j = 0; j < count; j++) {
      for (let k = 0; k < bpp; k++) {
        result.push(unit[k]);
      }
      pixelsDecoded++;
    }

    i += 1 + bpp;
  }

  return new Uint8Array(result);
}

function decodeRow(data, compression, bpp, width) {
  if (compression === C_NONE) {
    return data; // raw RGB/RGBA
  } else if (compression === C_RLE) {
    return rleDecode(data, bpp, width);
  } else {
    throw new Error("Unsupported compression: " + compression);
  }
}

function decodeNVGIF(bytes) {

  const view = new DataView(bytes.buffer);

  
  // Assert magic
  assert(bytes[0] === "N".codePointAt(0), "Invalid NVGIF");
  assert(bytes[1] === "V".codePointAt(0), "Invalid NVGIF");
  assert(bytes[2] === "G".codePointAt(0), "Invalid NVGIF");

  const version = bytes[3];
  let width = 0, height = 0, compression = C_NONE, alpha = false;

  switch (version) {
    case 1:
      width = view.getUint16(4, false);
      height = view.getUint16(6, false);
      break;
    case 2:
      compression = bytes[4];
      width = view.getUint16(5, false);
      height = view.getUint16(7, false);
      break;
    case 3:
    case 4:
      compression = bytes[4];
      alpha = !!bytes[5];
      width = view.getUint16(6, false);
      height = view.getUint16(8, false);
      break;
    default:
      throw new Error("Unsupported version: " + version);
  }


  const bpp = alpha ? 4 : 3;
  let offset = headerSizeForVersion(version);

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const imgData = ctx.createImageData(width, height);
  const pixelBuffer = imgData.data;

  if (version <= 3) {
    // Row-based decode
    for (let y = 0; y < height; y++) {
      const rowLength = view.getUint16(offset, false);
      offset += 2;

      const rowData = bytes.slice(offset, offset + rowLength);
      offset += rowLength;

      const decoded = decodeRow(rowData, compression, bpp, width);

      for (let x = 0; x < width; x++) {
        const srcIndex = x * bpp;
        const dstIndex = (y * width + x) * 4;
        pixelBuffer[dstIndex]     = decoded[srcIndex];
        pixelBuffer[dstIndex + 1] = decoded[srcIndex + 1];
        pixelBuffer[dstIndex + 2] = decoded[srcIndex + 2];
        pixelBuffer[dstIndex + 3] = bpp === 4 ? decoded[srcIndex + 3] : 255;
      }
    }
  } else if (version === 4) {
    if (compression === C_NONE || compression === C_RLE) {
      // Same row-based logic as v1–3
      for (let y = 0; y < height; y++) {
        const rowLength = view.getUint16(offset, false);
        offset += 2;
        const rowData = bytes.slice(offset, offset + rowLength);
        offset += rowLength;
        const decoded = decodeRow(rowData, compression, bpp, width);
        for (let x = 0; x < width; x++) {
          const srcIndex = x * bpp;
          const dstIndex = (y * width + x) * 4;
          pixelBuffer[dstIndex]     = decoded[srcIndex];
          pixelBuffer[dstIndex + 1] = decoded[srcIndex + 1];
          pixelBuffer[dstIndex + 2] = decoded[srcIndex + 2];
          pixelBuffer[dstIndex + 3] = bpp === 4 ? decoded[srcIndex + 3] : 255;
        }
      }
    } else if (compression === C_ZLIB) {
      const compressed = bytes.slice(offset);
      const decompressed = pako.inflate(compressed);

      assert(decompressed.length === width * height * bpp, "Zlib size mismatch");
      for (let i = 0, j = 0; i < decompressed.length; i += bpp, j += 4) {
        pixelBuffer[j]     = decompressed[i];
        pixelBuffer[j + 1] = decompressed[i + 1];
        pixelBuffer[j + 2] = decompressed[i + 2];
        pixelBuffer[j + 3] = bpp === 4 ? decompressed[i + 3] : 255;
      }
    } else if (compression === C_RLEZLIB) {
      const compressed = bytes.slice(offset);

      const decompressed = pako.inflate(compressed);

      let innerOffset = 0;
      for (let y = 0; y < height; y++) {
        const rowLength = (decompressed[innerOffset] << 8) | decompressed[innerOffset + 1];
        innerOffset += 2;
        const rowData = decompressed.slice(innerOffset, innerOffset + rowLength);
        innerOffset += rowLength;
        const rowDecoded = rleDecode(rowData, bpp, width);
        for (let x = 0; x < width; x++) {
          const srcIndex = x * bpp;
          const dstIndex = (y * width + x) * 4;
          pixelBuffer[dstIndex]     = rowDecoded[srcIndex];
          pixelBuffer[dstIndex + 1] = rowDecoded[srcIndex + 1];
          pixelBuffer[dstIndex + 2] = rowDecoded[srcIndex + 2];
          pixelBuffer[dstIndex + 3] = bpp === 4 ? rowDecoded[srcIndex + 3] : 255;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  return canvas;
}

class NVGIFImage {
  constructor(src) {
    this.onload = () => {};
    this.onerror = () => {};
    this.imgData = null;

    (async () => {
      try {
        const response = await fetch(src);
        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        const canvas = decodeNVGIF(bytes);
        const ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        this.onload();
      } catch (err) {
        this.onerror(err);
      }
    })();
  }
};

globalThis.NVGIFImage = NVGIFImage;

async function handleNVGIFImages() {
  document.querySelectorAll(`img[src$=".nvg"], img[src$=".nvg1"],
                             img[src$=".nvg2"], img[src$=".nvg3"], 
                             img[src$=".nvg4"]`).forEach(async(e) => {
    const img = new NVGIFImage(e.src);
    console.log("Loading image:", e.src);
    img.onload = async () => {
      e.dataset.originalSrc = e.src;
      e.src = URL.createObjectURL(await img.canvas.convertToBlob());
      console.log("Loaded image:", e.dataset.originalSrc);
    };
    img.onerror = () => {
      console.error("Failed to decode NVGIF:", e.src);
    };
  });
  document.querySelectorAll(`picture > source[srcset$=".nvg"], picture > source[srcset$=".nvg1"],
                             picture > source[srcset$=".nvg2"], picture > source[srcset$=".nvg3"], 
                             picture > source[srcset$=".nvg4"]`).forEach(async(e) => {
    const img = new NVGIFImage(e.srcset);
    console.log("Loading image:", e.srcset);
    img.onload = async () => {
      e.dataset.originalSrcset = e.srcset;
      e.srcset = URL.createObjectURL(await img.canvas.convertToBlob());
      console.log("Loaded image:", e.dataset.originalSrcset);
    };
    img.onerror = () => {
      console.error("Failed to decode NVGIF:", e.srcset);
    };
  });
}

// Initial scan
handleNVGIFImages();

// MutationObserver to catch new images
// this *is* efficient, as when the DOM is mutated, the previously .nvg sources
// have already been turned into blob URIs, so it doesn't re-decode those.
const observer = new MutationObserver(handleNVGIFImages);

observer.observe(document.body, {
  childList: true,
  subtree: true
});