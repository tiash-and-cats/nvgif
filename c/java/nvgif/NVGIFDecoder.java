package nvgif;

import java.io.IOException;
import java.awt.image.BufferedImage;
import com.sun.jna.*;

public class NVGIFDecoder {
    private interface NVGIFLibrary extends Library {
        NVGIFLibrary INSTANCE = Native.load("nvgif", NVGIFLibrary.class);

        @Structure.FieldOrder({ "pixels", "width", "height" })
        public static class NVGIFImage extends Structure {
            public Pointer pixels;
            public int width;
            public int height;
        }


        NVGIFImage nvg_decode_image(String filename);
        void nvg_free_image(NVGIFImage img);
        
        String nvg_get_errval();
    }

    public static BufferedImage decode(String filename) throws IOException {
        NVGIFLibrary.NVGIFImage natImg = NVGIFLibrary.INSTANCE.nvg_decode_image(filename);
        if (natImg == null) {
            throw new IOException(NVGIFLibrary.INSTANCE.nvg_get_errval());
        }

        int width = natImg.width;
        int height = natImg.height;
        byte[] pixels = natImg.pixels.getByteArray(0, width * height * 4);

        BufferedImage bi = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);

        int idx = 0;
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int r = pixels[idx++] & 0xFF;
                int g = pixels[idx++] & 0xFF;
                int b = pixels[idx++] & 0xFF;
                int a = pixels[idx++] & 0xFF;
                int argb = (a << 24) | (r << 16) | (g << 8) | b;
                bi.setRGB(x, y, argb);
            }
        }

        NVGIFLibrary.INSTANCE.nvg_free_image(natImg); // free native memory
        return bi;
    }
}