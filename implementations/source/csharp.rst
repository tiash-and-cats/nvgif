.. default-domain:: csharp

``namespace NVGIF`` - NVGIF C# Implementation
=============================================

.. namespace:: NVGIF

**Source:** `csharp/NVGIF.cs <https://github.com/tiash-and-cats/nvgif/blob/master/csharp/NVGIF.cs>`_

The C# implementation of NVGIF requires ``System.Drawing.Common``. It is Windows‑specific, supports v1–v4, and can only decode NVGIF files.  
Example usage: `csharp/NVGIFTest.cs <https://github.com/tiash-and-cats/nvgif/tree/master/csharp>`_.

.. class:: NVGIF

   An NVGIF decoder. Supports v1–4.

   .. enum:: CompressionType
   
      An enum of compression types.

      .. value:: None
      
         No compression.
      
      .. value:: RLE
      
         RLE compression.
         
      .. value:: Zlib
      
         Zlib compression.
         
      .. value:: RLE_Zlib
      
         RLE *and* Zlib compression. See spec for details.

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
