import java.awt.image.BufferedImage;
import java.io.File;
import javax.imageio.ImageIO;
import nvgif.NVGIFDecoder;

public class NVGIFTest {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.err.println("Usage: java NVGIFTest <file.nvg>");
            System.exit(1);
        }

        String filename = args[0];

        try {
            // Decode NVGIF into a BufferedImage
            BufferedImage img = NVGIFDecoder.decode(filename);

            // Save as PNG
            File outFile = new File("output.png");
            ImageIO.write(img, "png", outFile);

            System.out.println("Decoded NVGIF image saved as " + outFile.getAbsolutePath());
            System.out.println("Width: " + img.getWidth());
            System.out.println("Height: " + img.getHeight());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}