import pako from "https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm";

const C_NONE = 0;
const C_RLE = 1;
const C_ZLIB = 2;
const C_RLEZLIB = 3;
const C_RGB565 = 4

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
    case 4:
    case 5: return 11;
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

function batchRleDecode(data) {
  const decoded = [];
  let i = 0;
  while (i < data.length) {
    const count = data[i];
    const value = data[i + 1];
    for (let j = 0; j < count; j++) {
      decoded.push(value);
    }
    i += 2;
  }
  return Uint8Array.from(decoded);
}

function decodeRow(data, compression, bpp, width, version) {
  if (compression === C_NONE) {
    return data; // raw RGB/RGBA
  } else if (compression === C_RLE) {
    return rleDecode(data, bpp, width);
  } else if (version < 5) {
    throw new Error("Unsupported compression: " + compression);
  } else if (compression & C_RGB565) {
    const decoded = new Uint8Array(width * 3);
    for (let i = 0, j = 0; i < data.length; i += 2, j += 3) {
      const value = (data[i] << 8) | data[i + 1];
      const r = ((value >> 11) & 0x1F) << 3;
      const g = ((value >> 5) & 0x3F) << 2;
      const b = (value & 0x1F) << 3;
      decoded[j]     = r;
      decoded[j + 1] = g;
      decoded[j + 2] = b;
    }
    return decoded;
  } else {
    return data
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
    case 5:
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

      const decoded = decodeRow(rowData, compression, bpp, width, version);

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
  } else if (version >= 5) {
    let data = bytes.slice(offset);
  
    if (compression & C_ZLIB) {
      data = pako.inflate(data);
    }
    if (compression & C_RLE) {
      data = batchRleDecode(data);
    }
  
    let innerOffset = 0;
    for (let y = 0; y < height; y++) {
      const rowLen = (data[innerOffset] << 8) | data[innerOffset + 1];
      innerOffset += 2;
      const rowData = data.slice(innerOffset, innerOffset + rowLen);
      innerOffset += rowLen;
  
      const decoded = decodeRow(rowData, compression, bpp, width, version);
  
      console.log(decoded); 
  
      for (let x = 0; x < width; x++) {
        const srcIndex = x * bpp;
        const dstIndex = (y * width + x) * 4;
        pixelBuffer[dstIndex]     = decoded[srcIndex];
        pixelBuffer[dstIndex + 1] = decoded[srcIndex + 1];
        pixelBuffer[dstIndex + 2] = decoded[srcIndex + 2];
        pixelBuffer[dstIndex + 3] = bpp === 4 ? decoded[srcIndex + 3] : 255;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  return canvas;
}

async function loadNVGIF(url) {
  if (loadNVGIF.cache[url]) {
	return loadNVGIF.cache[url];
  }
  
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const canvas = decodeNVGIF(bytes);
  loadNVGIF.cache[url] = canvas;

  return canvas;
};
loadNVGIF.cache = {};
globalThis.loadNVGIF = loadNVGIF;

globalThis.NVGIFImage = class {
  constructor(src) {
    this.onload = () => {};
    this.onerror = () => {};
    this.imgData = null;

    this.reload();
  }
  reload() {
	(async () => {
      try {
        this.canvas = await loadNVGIF(src);
        this.imgData = this.canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);

        this.onload();
      } catch (err) {
        this.onerror(err);
      }
    })();
  }
};

async function handleNVGIFImages() {
  document.querySelectorAll(`img[src$=".nvg"], img[src$=".nvg1"],
                             img[src$=".nvg2"], img[src$=".nvg3"], 
                             img[src$=".nvg4"]`).forEach(async(e) => {
    try {
	  console.log("nvgif: Loading image:", e.src);
	  const start = Date.now();
      const canvas = await loadNVGIF(e.src);
      e.dataset.oldSrc = e.src;
      e.src = URL.createObjectURL(await canvas.convertToBlob());
      console.log("nvgif: Loaded image:", e.dataset.oldSrc, "in", Date.now() - start, "ms");
	} catch (err) {
      console.error("nvgif: Failed to decode NVGIF:", e.src, err);
	}
  });
  document.querySelectorAll(`picture > source[srcset$=".nvg"], 
                             picture > source[srcset$=".nvg1"],
                             picture > source[srcset$=".nvg2"], 
							 picture > source[srcset$=".nvg3"], 
                             picture > source[srcset$=".nvg4"]`).forEach(async(e) => {
    try {
      console.log("nvgif: Loading image:", e.srcset);
	  const start = Date.now();
      const canvas = await loadNVGIF(e.srcset);
      e.dataset.oldSrcset = e.srcset;
      e.srcset = URL.createObjectURL(await canvas.convertToBlob());
      console.log("nvgif: Loaded image:", e.dataset.oldSrcset, "in", Date.now() - start, "ms");
	} catch {
      console.error("nvgif: Failed to decode NVGIF:", e.src);
	}
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