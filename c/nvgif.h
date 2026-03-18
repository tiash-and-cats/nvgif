#ifndef NVGIF_H
#define NVGIF_H

#include <stdlib.h>
#include <stdarg.h>
#include <string.h>
#include <stdint.h>
#include <stdio.h>
#include "lodepng.h"

#define C_NONE 0
#define C_RLE  1

extern char nvg_error[128];

// Function declarations
uint16_t nvg__read_be16(FILE *f);
unsigned char* nvg__decode_rle(const unsigned char *row, int bpp, int expectedPixels);
unsigned char* nvg__decode_row(const unsigned char *row, int comp, int bpp, int w);
int nvg_decode_image(const char *filename, const char *outpng);
static int nvg__fread(void *addr, size_t size, size_t num, FILE *f);
int nvg__throwerr(const char *fmt, ...);

#endif