#ifndef NVGIF_H
#define NVGIF_H

#include <stdlib.h>
#include <stdarg.h>
#include <string.h>
#include <stdint.h>
#include <stdio.h>

#define nvg_COMPRESSION_NONE 0
#define nvg_COMPRESSION_RLE  1

#define nvg_ERRNO_IO_ERROR 0
#define nvg_ERRNO_NO_MEMORY 1
#define nvg_ERRNO_UNSUPPORTED 2
#define nvg_ERRNO_INVALID_DATA 3

/* Backwards compatibility */
#define nvg_error nvg_errval

#ifdef __cplusplus
extern "C" {
#endif

extern int nvg_errnum;
extern char nvg_errval[128];

const char *nvg_errnum_str[4] = {
    "I/O error",
    "not enough memory",
    "unsupported operation",
    "invalid data"
};

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