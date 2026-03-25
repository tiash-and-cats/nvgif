#include <opencv2/opencv.hpp>
#include "nvgif.h"

int main(int argc, char** argv) {
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " input.nvg [output.png]" << std::endl;
        return 1;
    }

    const char* infile = argv[1];
    const char* outfile = (argc >= 3) ? argv[2] : "out.png";

    // Decode NVGIF using C implementation
    nvg_Image* img = nvg_decode_image(infile);
    if (!img) {
        std::cerr << "NVGIF decode error: " << nvg_error << std::endl;
        return 1;
    }

    // Wrap pixels into an OpenCV Mat
    cv::Mat oldMat = cv::Mat(img->height, img->width, CV_8UC4, img->pixels).clone();
    cv::Mat mat;
    cv::cvtColor(oldMat, mat, cv::COLOR_RGBA2BGRA);

    // Free NVGIF image
    nvg_free_image(img);

    // Show the image
    cv::imshow("NVGIF Image", mat);
    cv::waitKey(0);

    // Save as PNG
    if (!cv::imwrite(outfile, mat)) {
        std::cerr << "Failed to save PNG: " << outfile << std::endl;
    } else {
        std::cout << "Saved PNG: " << outfile << std::endl;
    }

    return 0;
}