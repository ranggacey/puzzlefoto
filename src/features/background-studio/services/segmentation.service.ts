import { ImageSegmenter, FilesetResolver } from "@mediapipe/tasks-vision";

class SegmentationService {
  private segmenter: ImageSegmenter | null = null;
  private initializing: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.segmenter) return;
    if (this.initializing) return this.initializing;

    this.initializing = (async () => {
      // Use standard jsdelivr CDN for mediapipe WASM tasks
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      this.segmenter = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
          delegate: "GPU",
        },
        runningMode: "IMAGE",
        outputCategoryMask: true,
        outputConfidenceMasks: false,
      });
    })();
    
    await this.initializing;
    this.initializing = null;
  }

  async segment(imageElement: HTMLImageElement): Promise<Uint8ClampedArray> {
    if (!this.segmenter) {
      throw new Error("SegmentationService is not initialized");
    }
    
    const result = this.segmenter.segment(imageElement);
    
    if (!result.categoryMask) {
      throw new Error("No category mask returned by segmentation model");
    }

    // MediaPipe ImageSegmenter returns categoryMask which can be accessed as Uint8Array
    // Category 0 is background, Category 1 is person (for selfie_segmenter)
    const maskArray = result.categoryMask.getAsUint8Array();
    return new Uint8ClampedArray(maskArray);
  }
}

export const segmentationService = new SegmentationService();
