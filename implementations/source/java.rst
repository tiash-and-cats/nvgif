.. default-domain:: java

``package nvgif`` - Java bindings for ``nvgif.c``
=================================================

**Source:** `c/java/nvgif/NVGIFDecoder.java <https://github.com/tiash-and-cats/nvgif/blob/master/c/java/nvgif/NVGIFDecoder.java>`_

There is a Java binding for the C implementation.  
As such, it only supports v1–v3.  

It uses **Java Native Access (JNA)** to call the C dynamic library.  
It is not considered its own reference implementation because it is simply a binding, nothing more.  

To use it, you must `download the c/ folder <https://download-directory.github.io/?url=https://github.com/tiash-and-cats/nvgif/tree/master/c>`_ and follow the instructions in the README to build the Java bindings.  
After that’s done, copy everything inside ``java/dist`` to your project.

.. type:: public class NVGIFDecoder

   .. method:: public static java.awt.image.BufferedImage decode(String filename) throws java.io.IOException

      Decodes the image at ``filename`` and returns it in the form of a ``BufferedImage``.  
      Under the hood, it uses ``nvg_decode_image`` to decode the image, transforms it into a ``BufferedImage``, and then calls ``nvg_free_image`` to free the C ``Image`` structure.

.. rubric:: Example
   :heading-level: 1

.. code-block:: java

   import nvgif.NVGIFDecoder;
   import java.awt.image.BufferedImage;
   import javax.imageio.ImageIO;
   import java.io.File;

   public class NVGIFTest {
       public static void main(String[] args) throws Exception {
           if (args.length < 2) {
               System.err.println("Usage: NVGIFTest input.nvg output.png");
               return;
           }
           BufferedImage img = NVGIFDecoder.decode(args[0]);
           ImageIO.write(img, "png", new File(args[1]));
           System.out.println("Decoded " + args[0] + " and wrote " + args[1]);
       }
   }