import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from "@mediapipe/tasks-vision";

export class HandTrackingService {
  private landmarker: HandLandmarker | null = null;
  private isInitializing = false;
  private isReady = false;

  async initialize() {
    if (this.isReady || this.isInitializing) return;
    this.isInitializing = true;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
      );

      this.landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.isReady = true;
    } catch (err) {
      console.error("Failed to initialize HandTrackingService:", err);
      throw err;
    } finally {
      this.isInitializing = false;
    }
  }

  detectForVideo(video: HTMLVideoElement, timestamp: number): HandLandmarkerResult | null {
    if (!this.isReady || !this.landmarker) return null;
    return this.landmarker.detectForVideo(video, timestamp);
  }

  close() {
    if (this.landmarker) {
      this.landmarker.close();
      this.landmarker = null;
    }
    this.isReady = false;
  }
}

export const handTrackingService = new HandTrackingService();
