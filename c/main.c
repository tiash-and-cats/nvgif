#include "nvgif.h"
#include "lodepng.h"  // make sure lodepng is available

int main(int argc, char **argv) {
    if (argc < 3) {
        fprintf(stderr, "Usage: %s input.nvg output.png\n", argv[0]);
        return 1;
    }

    const char *infile = argv[1];
    const char *outfile = argv[2];

    // Decode NVGIF
    nvg_Image *img = nvg_decode_image(infile);
    if (!img) {
        fprintf(stderr, "NVGIF decode error: %s\n", nvg_error);
        return 1;
    }

    // Write PNG using lodepng
    unsigned error = lodepng_encode32_file(outfile, img->pixels, img->width, img->height);
    if (error) {
        fprintf(stderr, "lodepng error %u: %s\n", error, lodepng_error_text(error));
        nvg_free_image(img);
        return 1;
    }

    printf("Successfully decoded %s and wrote %s (%dx%d)\n",
           infile, outfile, img->width, img->height);

    // Clean up
    nvg_free_image(img);
    return 0;
}