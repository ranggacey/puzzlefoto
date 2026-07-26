import { 
  CameraError, 
  NotAllowedError, 
  NotFoundError, 
  NotReadableError, 
  CameraDevice, 
  FacingMode 
} from "@/features/photo-booth/types/camera";
import { DEFAULT_CAMERA_CONSTRAINTS } from "@/features/photo-booth/constants/camera";
import { cameraDebug, logStreamInfo, cameraWarn, startCameraTimer, endCameraTimer } from "@/features/photo-booth/utils/camera-debug";

class CameraService {
  /**
   * Enumerate available video input devices.
   */
  async enumerateDevices(): Promise<CameraDevice[]> {
    cameraDebug("[CameraService] enumerateDevices()");
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
   * Open the camera stream with given constraints.
   */
  async openStream(deviceId?: string | null, facingMode?: FacingMode): Promise<MediaStream> {
    cameraDebug("[CameraService] openStream() Requesting MediaStream", { deviceId, facingMode });
    startCameraTimer("getUserMedia");
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
      endCameraTimer("getUserMedia");
      cameraDebug("[CameraService] MediaStream created");
      logStreamInfo(stream, "[CameraService]");
      return stream;
    } catch (error) {
      endCameraTimer("getUserMedia");
      cameraDebug("[CameraService] getUserMedia failed", error);
      if (error instanceof Error) {
        cameraDebug(`name: ${error.name}\nmessage: ${error.message}`);
      }
      this.handleMediaError(error);
      throw error; 
    }
  }

  /**
   * Stop a specific stream.
   */
  stopStream(stream: MediaStream | null): void {
    cameraDebug("[CameraService] stopStream()");
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    } else {
      cameraWarn("[CameraService] stopStream() called with null stream");
    }
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
   * Get capabilities of a video track.
   */
  getCapabilities(stream: MediaStream | null): MediaTrackCapabilities | null {
    if (!stream) return null;
    const videoTrack = stream.getVideoTracks()[0];
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
