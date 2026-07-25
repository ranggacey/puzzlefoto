// ============================================================
// Hand tracking type definitions (for future implementation)
// ============================================================

import type { GestureType, Point } from "./index";

export interface HandLandmark {
  index: number;
  point: Point;
  visibility: number;
}

export interface HandTrackingResult {
  isDetected: boolean;
  landmarks: HandLandmark[];
  gesture: GestureType;
  confidence: number;
  handedness: "left" | "right";
}

export interface GestureConfig {
  pinchThreshold: number;
  grabThreshold: number;
  smoothingFactor: number;
  detectionInterval: number;
}
