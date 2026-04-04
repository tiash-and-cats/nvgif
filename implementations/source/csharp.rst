``namespace NVGIF`` - NVGIF C# Implementation
=======================

**Source:** `csharp/NVGIF.cs <https://github.com/tiash-and-cats/nvgif/blob/master/csharp/NVGIF.cs>`_

The C# implementation of NVGIF requires ``System.Drawing.Common``. It is Windows‑specific, supports v1–v4, and can only decode NVGIF files.  
Example usage: `csharp/NVGIFTest.cs <https://github.com/tiash-and-cats/nvgif/tree/master/csharp>`_.

.. class:: NVGIF.NVGIF

   An NVGIF decoder. Supports v1–4.

   .. attribute:: static enum CompressionType : byte
   
      An enum of compression types:

      - ``None = 0`` — No compression.
      - ``RLE = 1`` — RLE compression.
      - ``Zlib = 2`` — Zlib compression.
      - ``RLE_Zlib = 3`` — RLE *and* Zlib compression. See spec for details.

   .. method:: static Bitmap Decode(byte[] nvgData)

      Decode an NVGIF buffer (v1..v4) and return a ``Bitmap``.

.. rubric:: Example
   :heading-level: 1

Decode an NVGIF and save it as PNG:

.. code-block:: csharp

   using System;
   using System.Drawing;        // for Bitmap
   using System.Drawing.Imaging; // for ImageFormat
   using System.IO;

   class Program
   {
       static void Main(string[] args)
       {
           byte[] bytes = File.ReadAllBytes("../images/drawing.nvg4");
           Bitmap bmp = NVGIF.NVGIF.Decode(bytes);
           bmp.Save("decoded.png", ImageFormat.Png);
           Console.WriteLine("NVGIF decoded!");
       }
   }
