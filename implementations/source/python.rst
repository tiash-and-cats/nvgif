``nvgif`` - Python implementation of NVGIF
==========================================

**Source:** `python/nvgif/__init__.py <https://github.com/tiash-and-cats/nvgif/blob/master/python/nvgif/__init__.py>`_

.. py:class:: nvgif.NVGIF

   An NVGIF encoder and decoder.

   .. py:attribute:: DEFAULT_COMPRESSIONS

      A dictionary mapping versions to their default compression.

   .. py:function:: encode(image: str | PIL.Image.Image, out_path: str, version: int = 6, compression: list | None = None, alpha = False) -> None

      Takes the image at ``image`` and encodes it into an NVGIF with version ``version`` at ``out_path``.

      If ``alpha`` is true and ``version < 3``, then ``alpha`` is ignored.

      If ``compression`` is not given, it is set to ``NVGIF.DEFAULT_COMPRESSIONS[version]``, otherwise it must be a list of zero or more of these strings:

      - ``"rle"``: Run length encoding (v2+).
      - ``"zlib"``: Zlib compression (v4+).
      - ``"rlezlib"``: RLE *and* Zlib compression (v4).
      - ``"rgb565"``: RGB565 encoding (v5+).

   .. py:function:: decode(in_path: str[, out_path: str]) -> PIL.Image.Image | None

      Takes the NVGIF at ``in_path`` and decodes it into an image at ``out_path``.

      If ``out_path`` is not given, returns the decoded ``PIL.Image.Image``.

``nvgif.NvgifImagePlugin`` - NVGIF plugin for Pillow
====================================================

**Source:** `python/nvgif/NvgifImagePlugin.py <https://github.com/tiash-and-cats/nvgif/blob/master/python/nvgif/NvgifImagePlugin.py>`_

To use the NVGIF image plugin for Pillow, simply import it and Pillow will be able to open NVGIF images.

.. rubric:: Examples
   :heading-level: 1

Encode and decode images:

.. code-block:: Python

   from PIL import Image
   from nvgif import NVGIF

   # Encode a PNG into NVGIF v5 with RLE+Zlib and alpha
   img = Image.open("input.png").convert("RGBA")
   nvg = NVGIF()
   nvg.encode(img, "output.nvg", version=5, compression=["rle","zlib"], alpha=True)

   # Decode back into Pillow
   decoded = nvg.decode("output.nvg")
   decoded.show()

This can be rewritten using the ``NvgifImagePlugin``, which allows for seamless integration with Pillow:

.. code-block:: Python

   from PIL import Image
   import NvgifImagePlugin  # registers the NVGIF format with Pillow

   # Encode a PNG into NVGIF v5 with RLE+Zlib and alpha
   img = Image.open("input.png").convert("RGBA")
   img.save("output.nvg", format="NVGIF", version=5, compression=["rle","zlib"], alpha=True)

   # Decode back into Pillow
   img = Image.open("output.nvg")
   img.show()
