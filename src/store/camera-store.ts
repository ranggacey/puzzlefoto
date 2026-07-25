import { create } from "zustand";
import type { CaptureMode, LoadingState } from "@/types";

// ============================================================
// Camera Store (shell for future implementation)
// ============================================================

interface CameraState {
  /** Whether the camera stream is active */
  isActive: boolean;
  /** Current facing mode */
  facingMode: "user" | "environment";
  /** Selected device ID */
  deviceId: string | null;
  /** Stream initialization state */
  streamState: LoadingState;
  /** Error message if stream fails */
  error: string | null;

  // Actions
  setActive: (active: boolean) => void;
  setFacingMode: (mode: "user" | "environment") => void;
  setDeviceId: (id: string) => void;
  setStreamState: (state: LoadingState) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialCameraState = {
  isActive: false,
  facingMode: "user" as const,
  deviceId: null,
  streamState: "idle" as const,
  error: null,
};

export const useCameraStore = create<CameraState>((set) => ({
  ...initialCameraState,

  setActive: (active) => set({ isActive: active }),
  setFacingMode: (mode) => set({ facingMode: mode }),
  setDeviceId: (id) => set({ deviceId: id }),
  setStreamState: (state) => set({ streamState: state }),
  setError: (error) => set({ error }),
  reset: () => set(initialCameraState),
}));

// ============================================================
// Capture Store (shell for future implementation)
// ============================================================

interface CaptureState {
  /** Selected capture mode */
  mode: CaptureMode;
  /** Countdown value (3, 2, 1, 0) */
  countdown: number | null;
  /** Whether the capture is in progress */
  isCapturing: boolean;
  /** Captured image data URL */
  capturedImage: string | null;
  /** Processing state for background removal etc. */
  processingState: LoadingState;
  /** Selected virtual background URL */
  backgroundUrl: string | null;

  // Actions
  setMode: (mode: CaptureMode) => void;
  setCountdown: (value: number | null) => void;
  setCapturing: (capturing: boolean) => void;
  setCapturedImage: (image: string | null) => void;
  setProcessingState: (state: LoadingState) => void;
  setBackgroundUrl: (url: string | null) => void;
  reset: () => void;
}

const initialCaptureState = {
  mode: "original" as const,
  countdown: null,
  isCapturing: false,
  capturedImage: null,
  processingState: "idle" as const,
  backgroundUrl: null,
};

export const useCaptureStore = create<CaptureState>((set) => ({
  ...initialCaptureState,

  setMode: (mode) => set({ mode }),
  setCountdown: (value) => set({ countdown: value }),
  setCapturing: (capturing) => set({ isCapturing: capturing }),
  setCapturedImage: (image) => set({ capturedImage: image }),
  setProcessingState: (state) => set({ processingState: state }),
  setBackgroundUrl: (url) => set({ backgroundUrl: url }),
  reset: () => set(initialCaptureState),
}));
