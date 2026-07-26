import { 
  CameraError, 
  NotAllowedError, 
  NotFoundError, 
  NotReadableError, 
  CameraDevice, 
  FacingMode 
} from "../types/camera";
import { DEFAULT_CAMERA_CONSTRAINTS } from "../constants/camera";

class CameraService {
  private activeStream: MediaStream | null = null;
  private startStreamId = 0;

  /**
   * Request camera permissions.
   * If granted, stops the temporary stream immediately.
   */
  async requestPermission(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately, we just wanted permission
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      this.handleMediaError(error);
    }
  }

  /**
   * Enumerate available video input devices.
   */
  async enumerateDevices(): Promise<CameraDevice[]> {
    if (!navigator.mediaDevices?.enumerateDevices) {
      throw new CameraError("Device enumeration is not supported by this browser.");
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter((device) => device.kind === "videoinput")
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${index + 1}`,
        }));
    } catch (error) {
      this.handleMediaError(error);
      return [];
    }
  }

  /**
   * Start the camera stream with given constraints.
   */
  async startStream(deviceId?: string | null, facingMode?: FacingMode): Promise<MediaStream> {
    const currentId = ++this.startStreamId;
    
    // Ensure any existing stream is stopped first
    this.cleanup(); 

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new CameraError("getUserMedia is not supported by this browser.");
    }

    const constraints: MediaStreamConstraints = {
      ...DEFAULT_CAMERA_CONSTRAINTS,
      video: {
        ...(typeof DEFAULT_CAMERA_CONSTRAINTS.video === 'object' ? DEFAULT_CAMERA_CONSTRAINTS.video : {}),
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
        ...(facingMode && !deviceId ? { facingMode } : {}),
      },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // If another startStream was called while we were waiting, kill this one to avoid leaks
      if (this.startStreamId !== currentId) {
        stream.getTracks().forEach(t => t.stop());
        throw new CameraError("Camera start aborted because a newer request was made.");
      }

      this.activeStream = stream;
      return this.activeStream;
    } catch (error) {
      this.handleMediaError(error);
      throw error; 
    }
  }

  /**
   * Stop a specific stream or the currently active one.
   */
  stopStream(stream?: MediaStream | null): void {
    const targetStream = stream || this.activeStream;
    if (targetStream) {
      targetStream.getTracks().forEach((track) => track.stop());
    }
    if (targetStream === this.activeStream) {
      this.activeStream = null;
    }
  }

  /**
   * Restart the stream with new constraints.
   */
  async restartStream(deviceId?: string | null, facingMode?: FacingMode): Promise<MediaStream> {
    this.stopStream();
    return this.startStream(deviceId, facingMode);
  }

  /**
   * Stops all active tracks.
   */
  cleanup(): void {
    this.startStreamId++; // Invalidate any pending starts
    this.stopStream();
  }

  /**
   * Get the currently active stream.
   */
  getActiveStream(): MediaStream | null {
    return this.activeStream;
  }

  /**
   * Get supported constraints by the browser.
   */
  getSupportedConstraints(): MediaTrackSupportedConstraints {
    if (navigator.mediaDevices?.getSupportedConstraints) {
      return navigator.mediaDevices.getSupportedConstraints();
    }
    return {};
  }

  /**
   * Get capabilities of the current active video track.
   */
  getCapabilities(): MediaTrackCapabilities | null {
    if (!this.activeStream) return null;
    const videoTrack = this.activeStream.getVideoTracks()[0];
    if (videoTrack && videoTrack.getCapabilities) {
      return videoTrack.getCapabilities();
    }
    return null;
  }

  /**
   * Map standard DOMExceptions to our typed custom errors.
   */
  private handleMediaError(error: unknown): never {
    if (error instanceof Error) {
      // Don't remap custom CameraErrors we just threw ourselves
      if (error instanceof CameraError) {
        throw error;
      }
      
      switch (error.name) {
        case "NotAllowedError":
        case "SecurityError":
          throw new NotAllowedError();
        case "NotFoundError":
        case "OverconstrainedError":
          throw new NotFoundError();
        case "NotReadableError":
        case "TrackStartError":
          throw new NotReadableError();
        default:
          throw new CameraError(error.message || "An unknown camera error occurred.");
      }
    }
    throw new CameraError("An unknown camera error occurred.");
  }
}

export const cameraService = new CameraService();
