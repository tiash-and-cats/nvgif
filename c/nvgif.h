#ifndef NVGIF_H
#define NVGIF_H

#include <stdlib.h>
#include <stdarg.h>
#include <string.h>
#include <stdint.h>
#include <stdio.h>

#define C_NONE 0
#define C_RLE  1

#ifdef __cplusplus
extern "C" {
#endif

extern char nvg_error[128];

typedef struct {
    unsigned char *pixels; // RGBA buffer
    int width;
    int height;
} nvg_Image;

// Function declarations
int nvg__read_be16(FILE *f, uint16_t *out);
unsigned char* nvg__decode_rle(const unsigned char *row, int bpp, int expectedPixels);
unsigned char* nvg__decode_row(const unsigned char *row, int comp, int bpp, int w);
int nvg__fread(void *addr, size_t size, size_t num, FILE *f);
void* nvg__throwerr(const char *fmt, ...);

nvg_Image* nvg_decode_image(const char *filename);
void nvg_free_image(nvg_Image *img);

#ifdef __cplusplus
}
#endif


#endif /* !defined NVGIF_H */