import pako from "https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm";

const C_NONE = 0;
const C_RLE = 1;
const C_ZLIB = 2;
const C_RLEZLIB = 3;
const C_RGB565 = 4;

/*
  CRC32 lookup table, precomputed for efficiency.
  Generated with:

  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  table = new Uint32Array(table);
*/
const crc32Table = new Uint32Array([0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,936918000,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117]);

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
    case 6: return 14;
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

function crc32(data) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ crc32Table[(crc ^ data[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function decodeNVGIF(bytes) {
  const view = new DataView(bytes.buffer);

  // Assert magic
  assert(bytes[0] === "N".codePointAt(0), "Invalid NVGIF");
  assert(bytes[1] === "V".codePointAt(0), "Invalid NVGIF");
  assert(bytes[2] === "G".codePointAt(0), "Invalid NVGIF");

  const version = bytes[3];
  let width = 0, height = 0, compression = C_NONE, alpha = false, checksum = 0;

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
    case 6:
      compression = bytes[4];
      alpha = !!bytes[5];
      width = view.getUint16(6, false);
      height = view.getUint16(8, false);
      checksum = view.getUint32(10, false);
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
    
    if (version >= 6 && checksum !== crc32(data)) {
      throw new Error("checksum verification failed");
    }
  
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
  loadNVGIF.cache[new URL(url, document.baseURI).href] = canvas;

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
  async function decode(e, attr="src") {
    try {
      const src = new URL(e[attr], document.baseURI).href;
      console.log("nvgif: Loading image:", src);
      const start = Date.now();
      const canvas = await loadNVGIF(src);
      e.dataset["old" + attr] = e[attr];
      e[attr] = URL.createObjectURL(await canvas.convertToBlob());
      console.log("nvgif: Loaded image:", src, "in", Date.now() - start, "ms");
    } catch (err) {
      console.error("nvgif: NVGIF decode error:", err, "while decoding", e[attr]);
    }
  }

  document.querySelectorAll(`img[src$=".nvg"],  img[src$=".nvg1"],
                             img[src$=".nvg2"], img[src$=".nvg3"], 
                             img[src$=".nvg4"], img[src$=".nvg5"],
                             img[src$=".nvg6"]`).forEach(e => decode(e, "src"));
  document.querySelectorAll(`picture > source[srcset$=".nvg"],
                             picture > source[srcset$=".nvg1"],
                             picture > source[srcset$=".nvg2"], 
                             picture > source[srcset$=".nvg3"], 
                             picture > source[srcset$=".nvg4"],
							               picture > source[srcset$=".nvg5"],
							               picture > source[srcset$=".nvg6"]`).forEach(e => decode(e, "srcset"));
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