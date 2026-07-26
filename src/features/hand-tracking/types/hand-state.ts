export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface HandState {
  detected: boolean;

  pointer: {
    x: number; // Normalized [0, 1] relative to video container width
    y: number; // Normalized [0, 1] relative to video container height
  };

  landmarks: NormalizedLandmark[];

  handedness: "left" | "right";

  confidence: number;

  pinch: boolean;
}
