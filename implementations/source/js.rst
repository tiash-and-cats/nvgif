.. default-domain:: js

``nvgif.js`` - NVGIF JavaScript implementation
==============================================

**Source:** `nvgif.js <https://github.com/tiash-and-cats/nvgif.js>`_

The JavaScript implementation of NVGIF uses ``pako`` via jsDelivr.  
It uses a ``MutationObserver`` to look for changes in the DOM.  
When it detects one, it sweeps through all undecoded NVGIFs in the page and decodes them.  

It supports ``<img>`` and ``<picture>`` elements.  
It supports all versions (decode‑only).

.. function:: async globalThis.loadNVGIF(src)

   Decodes the NVGIF at the URL ``src`` and returns the image data in the form of an `OffscreenCanvas <https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas>`_.

.. class:: globalThis.NVGIFImage(src)

   This class tries to mimic the behavior of ``Image``.  
   When it is created, it starts loading the image at ``src``.

   - If the load succeeds, calls ``onload`` with no arguments and sets ``imgData`` to an ``ImageData`` object with the decoded data.  
   - If the load fails, calls ``onerror`` with no arguments.

   .. attribute:: onload

      A callback called upon a successful load.

   .. attribute:: onerror

      A callback called upon a failed load.

   .. attribute:: imgData

      If the load was successful, contains an `ImageData <https://developer.mozilla.org/en-US/docs/Web/API/ImageData>`_ object with decoded image data, otherwise ``null``.

   .. attribute:: canvas

      If the load was successful, contains an `OffscreenCanvas <https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas>`_ object with decoded image data on its surface, otherwise ``null``.

.. rubric:: Example
   :heading-level: 1

Show an NVGIF via the image element:

.. code-block:: html

   <img src="images/drawing.nvg">

   <script type="module" src="nvgif.js"></script> <!-- nvgif.js -->

Draw an image onto a canvas:

.. code-block:: html

   <canvas id="myCanvas" width="400" height="400" style="border:1px solid grey"></canvas>
   <script type="module" src="nvgif.js"></script> <!-- nvgif.js -->
   <script>
   window.addEventListener("DOMContentLoaded", () => { // important!!
     (async() => {
       const imgCanvas = await loadNVGIF("images/drawing.nvg");
       const canvas = document.getElementById("myCanvas");
       const ctx = canvas.getContext("2d");
       ctx.drawImage(imgCanvas, 40, 40);
     })();
   });
   </script>