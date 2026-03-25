# NVGIF C implementation
# Copyright (c) tiash-and-cats & contributors
# The NVGIF docs & reference implementations are licensed under the MIT License.
# In practice this means you can use this code in your projects without paying
# any kind of fee or subscription.

# tab char: (	)

CC=tcc
FLAGS=
OPENCV=E:\opencv
OPENCV_LIB=opencv_world4120.lib
OUTC=nvgifsimple.exe
OUTCPP=nvgifopencv.exe

simple:
	$(CC) -o $(OUTC) -I. main.c lodepng.c nvgif.c $(FLAGS)

opencv:
	cl /EHsc main.cpp nvgif.c \
	/I"$(OPENCV)\build\include" \
	/Fe"$(OUTCPP)" /link $(OPENCV_LIB) $(FLAGS)