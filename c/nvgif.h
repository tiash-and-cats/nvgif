#ifndef NVGIF_H
#define NVGIF_H

#include <stdlib.h>
#include <stdarg.h>
#include <string.h>
#include <stdint.h>
#include <stdio.h>

#define nvg_COMPRESSION_NONE 0
#define nvg_COMPRESSION_RLE  1

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
nvg_Image* nvg_decode_image(const char *filename);
void nvg_free_image(nvg_Image *img);

#ifdef __cplusplus
}
#endif


#endif /* !defined NVGIF_H */