.. default-domain:: c

``nvgif.c`` & ``nvgif.h`` - NVGIF's C Implementation
====================================================

**Source:** `c/nvgif.c <https://github.com/tiash-and-cats/nvgif/blob/master/c/nvgif.c>`_,  
`c/nvgif.h <https://github.com/tiash-and-cats/nvgif/blob/master/c/nvgif.h>`_

The C implementation of NVGIF was tested with **TCC 0.9.27** and **MSVC++ 19.50.35727** for x64.  
It only supports v1–v3 decoding right now.  

To use it, download the files and link against ``nvgif.c``, and include the header file ``nvgif.h``.  
It has been tested with **lodepng (C)** and **OpenCV (C++)**. Examples are in `c/ <https://github.com/tiash-and-cats/nvgif/tree/master/c>`_.

.. warning::

   This API is **not thread‑safe**!  
   If you want threads, you must synchronize it yourself.

.. type:: nvg_Image

   A structure that represents a decoded NVGIF.

   .. member:: unsigned char *pixels

      A buffer that contains RGBA data.

   .. member:: int width

      The width of the image.

   .. member:: int height

      The height of the image.

.. function:: nvg_Image* nvg_decode_image(const char *filename)

   Decodes the NVGIF at ``filename``.  
   On success, returns a pointer to an ``nvg_Image``.  
   On failure, returns ``NULL`` and sets ``nvg_errnum`` and ``nvg_errval``.

.. function:: void nvg_free_image(nvg_Image *img)

   Frees the image at ``img``.  
   This must be called after you are done with image structs returned from ``nvg_decode_image``.

.. var:: int nvg_errnum

   A global integer that contains one of the ``nvg_ERRNO_*`` constants.  
   It represents the type of error.  
   Starts out as ``-1``. When an error occurs, a ``nvg_ERRNO_*`` constant is written to it.  
   **Not thread‑safe; concurrent calls may overwrite each other.**

.. var:: char nvg_errval[128]

   A global buffer that contains the most recent error message.  
   Starts out empty. When an error occurs, a formatted string is written into this buffer using ``vsnprintf``.  
   Messages longer than 127 characters are truncated.  
   **Not thread‑safe; concurrent calls may overwrite each other.**

.. macro:: nvg_error

   An alias for backwards‑compatibility reasons. Still commonly used.  
   Equivalent to ``nvg_errval``.

.. function:: const char* nvg_get_errval(void)

   This function is included purely for FFI reasons.  
   It simply returns the value of ``nvg_errval``.

Error Constants
---------------

These constants represent different categories of errors.

.. macro:: nvg_ERRNO_IO_ERROR

   **Value:** 0
   
   IO error.

.. macro:: nvg_ERRNO_NO_MEMORY

   **Value:** 1
   
   Not enough memory.

.. macro:: nvg_ERRNO_UNSUPPORTED

   **Value:** 2
   
   Unsupported operation.

.. macro:: nvg_ERRNO_INVALID_DATA

   **Value:** 3
   
   Invalid data.

.. var:: const char *nvg_errnum_str[4]

   A mapping that maps each ``nvg_ERRNO_*`` constant to a human‑readable description.

.. rubric:: Example
   :heading-level: 1

This code was reproduced from `c/main.c <https://github.com/tiash-and-cats/nvgif/blob/master/c/main.c>`_. It uses **lodepng**.

.. code-block:: c

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
           fprintf(stderr, "NVGIF decode error: (%s) %s\n",
                   nvg_errnum_str[nvg_errnum], nvg_errval);
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

.. rubric:: Important note for OpenCV
   :heading-level: 1

The ``pixels`` buffer in ``nvg_Image`` is **RGBA**.  
OpenCV expects **BGRA** (or BGR) channel ordering.  
To display or save correctly, convert after wrapping into a ``cv::Mat``:

.. code-block:: cpp

   cv::Mat rgba(img->height, img->width, CV_8UC4, img->pixels);
   cv::Mat bgra;
   cv::cvtColor(rgba, bgra, cv::COLOR_RGBA2BGRA);

Without this conversion, colors will appear swapped (e.g. red → blue).