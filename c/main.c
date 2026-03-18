#include <stdio.h>
#include "nvgif.h"

int main(int argc, char **argv) {
    if (argc != 3) {
        fprintf(stderr, "Usage: %s <input.nvg> <output.png>\n", argv[0]);
        return 1;
    }

    const char *infile = argv[1];
    const char *outfile = argv[2];

    int result = nvg_decode_image(infile, outfile);
    if (result < 0) {
        fprintf(stderr, "Error: %s\n", nvg_error);
        return 1;
    }

    printf("Successfully decoded %s to %s\n", infile, outfile);
    return 0;
}