export type FacingMode = "user" | "environment";
export type Resolution = "720p" | "1080p";

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export type PermissionStatus = "prompt" | "granted" | "denied";

export type CaptureFormat = "dataUrl" | "blob" | "bitmap";

export interface CaptureOptions {
  format?: CaptureFormat;
  mirror?: boolean;
}

// ---------------------------------------------------------
// Custom Errors
// ---------------------------------------------------------

export class CameraError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CameraError";
  }
}

export class NotAllowedError extends CameraError {
  constructor(message: string = "Camera access denied by user or system.") {
    super(message);
    this.name = "NotAllowedError";
  }
}

export class NotFoundError extends CameraError {
  constructor(message: string = "No camera hardware detected.") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class NotReadableError extends CameraError {
  constructor(message: string = "Camera is already in use by another application.") {
    super(message);
    this.name = "NotReadableError";
  }
}

export type CameraState =
  | "IDLE"
  | "REQUESTING_PERMISSION"
  | "STARTING"
  | "READY"
  | "CAPTURING"
  | "PREVIEW"
  | "STOPPING"
  | "STOPPED"
  | "ERROR";

export interface CameraContextType {
  state: CameraState;
  devices: CameraDevice[];
  deviceId: string | null;
  facingMode: FacingMode;
  error: string | null;
  
  start: () => Promise<void>;
  stop: () => void;
  restart: () => Promise<void>;
  capture: () => Promise<string | null>;
  switchCamera: () => void;
  attachVideo: (videoElement: HTMLVideoElement | null) => void;
}

