import { CaptureOptions } from "@/features/photo-booth/types/camera";

class CaptureService {
  /**
   * Captures a frame from a video element and returns it in the requested format.
   */
  async captureFrame(
    videoElement: HTMLVideoElement,
    options: CaptureOptions = {}
  ): Promise<string | Blob | ImageBitmap | null> {
    const { format = "dataUrl", mirror = false } = options;

    if (!videoElement.videoWidth || !videoElement.videoHeight) {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    if (mirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    switch (format) {
      case "dataUrl":
        return canvas.toDataURL("image/png");
      case "blob":
        return new Promise((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob);
          }, "image/png");
        });
      case "bitmap":
        return createImageBitmap(canvas);
      default:
        return canvas.toDataURL("image/png");
    }
  }
}

export const captureService = new CaptureService();
