#include <opencv2/opencv.hpp>
#include "nvgif.h"

int main(int argc, char** argv) {
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " input.nvg [output.png]" << std::endl;
        return 1;
    }

    const char* infile = argv[1];
    const char* outfile = (argc >= 3) ? argv[2] : "out.png";

    // Decode NVGIF using your C implementation
    nvg_Image* img = nvg_decode_image(infile);
    if (!img) {
        std::cerr << "NVGIF decode error: " << nvg_error << std::endl;
        return 1;
    }

    // Wrap pixels into an OpenCV Mat (temporary wrapper)
    cv::Mat oldMat(img->height, img->width, CV_8UC4, img->pixels);

    // Clone so OpenCV owns its own copy
    cv::Mat rgba = oldMat.clone();

    // Free NVGIF image (safe now, since OpenCV has its own copy)
    nvg_free_image(img);
    
    // Convert to BGRA (which is what OpenCV expects)
    cv::Mat mat;
    cv::cvtColor(rgba, mat, cv::COLOR_RGBA2BGRA);

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