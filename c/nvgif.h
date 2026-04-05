#ifndef NVGIF_H
#define NVGIF_H

#include <stdlib.h>
#include <stdarg.h>
#include <string.h>
#include <stdint.h>
#include <stdio.h>

#define nvg_COMPRESSION_NONE 0
#define nvg_COMPRESSION_RLE  1
#define nvg_COMPRESSION_ZLIB  2
#define nvg_COMPRESSION_RLE_ZLIB  3

#define nvg_ERRNO_IO_ERROR 0
#define nvg_ERRNO_NO_MEMORY 1
#define nvg_ERRNO_UNSUPPORTED 2
#define nvg_ERRNO_INVALID_DATA 3

/* Backwards compatibility */
#define nvg_error nvg_errval

#ifdef DYLIB
    #if defined(_WIN32) || defined(_WIN64)
        #include <windows.h>
        #define nvg__EXPORT __declspec(dllexport)
    #else
        #define nvg__EXPORT __attribute__((visibility("default")))
    #endif
#else
    #define nvg__EXPORT
#endif

#ifdef __cplusplus
extern "C" {
#endif

extern int nvg_errnum;
extern char nvg_errval[128];

extern const char *nvg_errnum_str[4];

typedef struct {
    unsigned char *pixels; // RGBA buffer
    int width;
    int height;
} nvg_Image;

// Function declarations
nvg_Image* nvg_decode_image(const char *filename);
void nvg_free_image(nvg_Image *img);
const char* nvg_get_errval(void);

#ifdef __cplusplus
}
#endif


#endif /* !defined NVGIF_H */