# NVGIF C implementation
# Copyright (c) tiash-and-cats & contributors
# The NVGIF docs & reference implementations are licensed under the MIT License.
# In practice this means you can use this code in your projects without paying
# any kind of fee or subscription.

CC=tcc
CXX=cl
FLAGS=
OPENCV=E:\opencv
OPENCV_LIB=opencv_world4120.lib

ifeq ($(OS),Windows_NT)
    EXEC=.exe
    DYLIB=.dll
    PATHSEP=\;
else
    EXEC=
    DYLIB=.so
    PATHSEP=:
endif

OUTC=nvgifsimple$(EXEC)
OUTCPP=nvgifopencv$(EXEC)

simple:
	$(CC) -o $(OUTC) -I. main.c lodepng.c nvgif.c $(FLAGS)

opencv:
ifeq ($(CXX),cl)
	$(CXX) /EHsc main.cpp nvgif.c /I"$(OPENCV)\build\include" /Fe"$(OUTCPP)" /link $(OPENCV_LIB) $(FLAGS)
else
	$(CXX) main.cpp nvgif.c -I$(OPENCV)/build/include -o $(OUTCPP) $(OPENCV_LIB) $(FLAGS)
endif


java:
	$(CC) -shared -o java/dist/nvgif$(DYLIB) -DDYLIB -I. nvgif.c
	javac -cp java/jna-jpms-5.18.1.jar -d java/dist java/nvgif/*.java

jdemo:
	javac -cp java/jna-jpms-5.18.1.jar$(PATHSEP)java/dist -d java java/NVGIFTest.java

.PHONY: simple opencv java jdemo