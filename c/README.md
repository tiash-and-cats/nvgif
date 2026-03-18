# NVGIF C demo

To run the demo, do:
``` bash
make
```
It defaults to compiling with TCC. To compile with GCC, you can do:
``` bash
make CC=gcc
```
If you need to add more compile flags, you can do:
``` bash
make CC=gcc FLAGS=<--someflag>
```
You will get an executable called `nvgifdecode.exe` that decodes NVGIFs of versions 1 and 2.