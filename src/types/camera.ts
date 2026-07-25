// ============================================================
// Camera-related type definitions (for future implementation)
// ============================================================

export interface CameraDevice {
  deviceId: string;
  label: string;
  facingMode: "user" | "environment";
}

export interface CameraConstraints {
  width: number;
  height: number;
  facingMode: "user" | "environment";
  frameRate: number;
}

export interface CameraCapabilities {
  hasMultipleCameras: boolean;
  supportsHighResolution: boolean;
  supportsTorch: boolean;
}
