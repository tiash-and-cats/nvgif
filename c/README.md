# NVGIF C & Java demos

The Makefile provides multiple build targets for NVGIF:

- `make simple` → builds the pure C decoder with TinyCC by default.
- `make opencv` → builds the OpenCV viewer & decoder (MSVC++ on Windows, g++/clang on Linux/macOS).
- `make -B java` → builds the native NVGIF shared library (`.dll`/`.so`) and compiles the Java bindings.
- `make jdemo` → compiles the Java demo program (`NVGIFTest.java`).

By default:
- `make` → runs `make simple`.

## Variables

You can override variables at the command line:

- `CC` → C compiler (default: `tcc`)
- `CXX` → C++ compiler (default: `cl` on Windows)
- `FLAGS` → extra flags for C/C++ compiler
- `OUTC` → C compiler output (default: `nvgifsimple.exe`)
- `OUTCPP` → C++ compiler output (default: `nvgifopencv.exe`)
- `OPENCV` → path to OpenCV installation (default: `E:\opencv`)
- `OPENCV_LIB` → OpenCV monolithic library name (default: `opencv_world4120.lib`)

Examples:
```bash
make simple CC=gcc FLAGS="-O2 -Wall"
make opencv OPENCV=./opencv OPENCV_LIB=opencv_world480.lib
make OUTC=D:\nvgiftest.exe
```

## Java Demo

To build the Java bindings and demo:

```bash
make -B java
make jdemo
```

This produces:
- `java/dist/nvgif.dll` (Windows)
- `java/dist/nvgif.so` (Linux/macOS)
- Compiled Java classes in `java/dist/nvgif/`
- The demo class `NVGIFTest.class` in `java/`

### Running the demo

`cd` into `java`, then run with the correct classpath including JNA:

**Windows:**
```bash
java --enable-native-access=ALL-UNNAMED -cp .;dist;jna-jpms-5.18.1.jar NVGIFTest <filename>
```

**Linux/macOS:**
```bash
java --enable-native-access=ALL-UNNAMED -cp .;dist;jna-jpms-5.18.1.jar NVGIFTest <filename>
```

This will decode `<filename>` and save the result as `output.png`.
