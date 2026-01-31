using System;
using System.Drawing;        // for Bitmap
using System.Drawing.Imaging; // for ImageFormat
using System.IO;

class Program
{
    static void Main(string[] args)
    {
        byte[] bytes = File.ReadAllBytes("../images/drawing.nvg");
        Bitmap bmp = NVGIF.NVGIF.Decode(bytes);
        bmp.Save("decoded.png", ImageFormat.Png);
        Console.WriteLine("NVGIF decoded!");
    }
}