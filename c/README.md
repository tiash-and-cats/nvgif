# NVGIF C demo

- `make simple` → builds the pure C decoder with TinyCC by default.
- `make opencv` → builds the OpenCV viewer & decoder with MSVC++.
- `make` → defaults to `make simple`.

You can override variables at the command line:
- `CC` → compiler (default: tcc)
- `FLAGS` → extra flags for C/C++ compiler
- `OUTC` → C compiler output (default: `nvgifsimple.exe`)
- `OUTCPP` → C++ compiler output (default: `nvgifopencv.exe`)
- `OPENCV` → path to OpenCV installation (default: `E:\opencv`)
- `OPENCV_LIB` → OpenCV monolithic library name (default: `opencv_world4120.lib`)

Examples:
- `make simple CC=gcc FLAGS="-O2 -Wall"`
- `make opencv OPENCV=./opencv OPENCV_LIB=opencv_world480.lib`
- `make OUTC=D:\nvgiftest.exe`