/*
NVGIF C implementation
Copyright (c) tiash-and-cats & contributors
The NVGIF docs & reference implementations are licensed under the MIT License.
In practice this means you can use this code in your projects without paying
any kind of fee or subscription.
*/

#include "nvgif.h"

#ifdef __cplusplus
extern "C" {
#endif

char nvg_error[128];

static void* nvg__throwerr(const char *fmt, ...) {
    va_list args;
    va_start(args, fmt);
    vsnprintf(nvg_error, sizeof(nvg_error), fmt, args);
    va_end(args);
    return NULL; // caller must return this if desired
}

static int nvg__fread(void *addr, size_t size, size_t num, FILE *f) {
    if (fread(addr, size, num, f) != num) {
        fclose(f);
        return -1;
    }
    return 0;
}

static int nvg__read_be16(FILE *f, uint16_t *out) {
    unsigned char buf[2];
    if (nvg__fread(buf, 1, 2, f) < 0) {
        return -1; // signal error
    }
    *out = (buf[0] << 8) | buf[1];
    return 0; // success
}

static unsigned char* nvg__decode_rle(const unsigned char *row, int bpp, int expectedPixels) {
    unsigned char *result = malloc(expectedPixels * bpp);
    if (!result) {
        nvg__throwerr("not enough memory for RLE decode"); return NULL;
    }
    int i = 0, pixelsDecoded = 0, out = 0;
    while (pixelsDecoded < expectedPixels) {
        unsigned char count = row[i];
        const unsigned char *unit = row + i + 1;
        for (int j = 0; j < count && pixelsDecoded < expectedPixels; j++) {
            memcpy(result + out, unit, bpp);
            out += bpp;
            pixelsDecoded++;
        }
        i += 1 + bpp;
    }
    return result;
}

static unsigned char* nvg__decode_row(const unsigned char *row, int comp, int bpp, int w) {
    if (comp == nvg_COMPRESSION_NONE) {
        unsigned char *copy = malloc(w * bpp);
        if (!copy) {
            nvg__throwerr("not enough memory for raw row"); return NULL;
        }
        memcpy(copy, row, w * bpp);
        return copy;
    } else if (comp == nvg_COMPRESSION_RLE) {
        return nvg__decode_rle(row, bpp, w);
    } else {
        nvg__throwerr("unsupported compression type %d", comp); return NULL;
    }
}

void nvg_free_image(nvg_Image *img) {
    if (img) {
        free(img->pixels);
        free(img);
    }
}

nvg_Image* nvg_decode_image(const char *filename) {
    FILE *f = fopen(filename, "rb");
    if (!f) {
        return nvg__throwerr("unable to open file");
    }

    char magic[3];
    if (nvg__fread(magic, 1, 3, f) < 0) {
        return nvg__throwerr("failed to read magic");
    }
    unsigned char version;
    if (nvg__fread(&version, 1, 1, f) < 0) {
        return nvg__throwerr("failed to read version");
    }

    if (magic[0] != 'N' || magic[1] != 'V' || magic[2] != 'G') {
        fclose(f);
        return nvg__throwerr("could not find NVGIF magic");
    }

    if (version < 1 || version > 3) {
        fclose(f);
        return nvg__throwerr("unsupported NVGIF version (v1 & v3 supported)");
    }

    int comp = nvg_COMPRESSION_NONE;
    if (version >= 2) {
        if (nvg__fread(&comp, 1, 1, f) < 0) {
            return nvg__throwerr("failed to read compression");
        }
    }
    int alpha = 0;
    if (version >= 3) {
        if (nvg__fread(&alpha, 1, 1, f) < 0) {
            return nvg__throwerr("failed to read alpha flag");
        }
    }
    int bpp = (alpha ? 4 : 3);

    uint16_t w;
    if (nvg__read_be16(f, &w) < 0) {
        return nvg__throwerr("failed to read width");
    }
    uint16_t h;
    if (nvg__read_be16(f, &h) < 0) {
        return nvg__throwerr("failed to read height");
    }

    unsigned char *pixels = malloc(w * h * 4);
    if (!pixels) {
        fclose(f);
        return nvg__throwerr("not enough memory to allocate pixels");
    }

    for (int y = 0; y < h; y++) {
        uint16_t rowlen;
        if (nvg__read_be16(f, &rowlen) < 0) {
            return nvg__throwerr("could not read row length");
        }
        unsigned char *row = malloc(rowlen);
        if (!row) {
            fclose(f);
            return nvg__throwerr("not enough memory to allocate row");
        }
        if (nvg__fread(row, 1, rowlen, f) < 0) {
            free(row);
            return nvg__throwerr("could not read row");
        }

        unsigned char *decoded = nvg__decode_row(row, comp, bpp, w);
        if (!decoded) {
            free(row);
            fclose(f);
            return NULL;
        }

        for (int x = 0; x < w; x++) {
            int src = x * bpp;
            int dst = (y * w + x) * 4;
            pixels[dst]     = decoded[src];
            pixels[dst + 1] = decoded[src + 1];
            pixels[dst + 2] = decoded[src + 2];
            pixels[dst + 3] = (bpp == 4) ? decoded[src + 3] : 255;
        }

        free(row);
        free(decoded);
    }

    fclose(f);

    nvg_Image *img = malloc(sizeof(nvg_Image));
    if (!img) { return nvg__throwerr("not enough memory for image struct"); }
    img->width = w;
    img->height = h;
    img->pixels = pixels;

    return img;
}

#ifdef __cplusplus
} /* extern "C" */
#endif