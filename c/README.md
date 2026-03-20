# NVGIF C implementation

- `make simple` → builds the pure C decoder with TinyCC (default).
- `make opencv` → builds the OpenCV viewer & decoder with MSVC++.

You can override variables at the command line:
- `CC` → compiler (default: tcc)
- `FLAGS` → extra flags for C compiler
- `OPENCV` → path to OpenCV installation (default: E:\opencv)
- `OPENCV_LIB` → OpenCV monolithic library name (default: opencv_world4120.lib)

Examples:
- `make simple CC=gcc FLAGS="-O2 -Wall"`
- `make opencv OPENCV=./opencv OPENCV_LIB=opencv_world480.lib`