import { create } from "zustand";
import type { CaptureMode, LoadingState } from "@/types";
import type { CameraDevice, PermissionStatus } from "@/features/photo-booth/types/camera";

// ============================================================
// Camera Store
// ============================================================

interface CameraState {
  permissionStatus: PermissionStatus;
  devices: CameraDevice[];
  activeStream: MediaStream | null;
  isActive: boolean;
  facingMode: "user" | "environment";
  deviceId: string | null;
  streamState: LoadingState;
  error: string | null;

  // Actions
  setPermissionStatus: (status: PermissionStatus) => void;
  setDevices: (devices: CameraDevice[]) => void;
  setActiveStream: (stream: MediaStream | null) => void;
  setActive: (active: boolean) => void;
  setFacingMode: (mode: "user" | "environment") => void;
  setDeviceId: (id: string | null) => void;
  setStreamState: (state: LoadingState) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialCameraState = {
  permissionStatus: "prompt" as const,
  devices: [],
  activeStream: null,
  isActive: false,
  facingMode: "user" as const,
  deviceId: null,
  streamState: "idle" as const,
  error: null,
};

export const useCameraStore = create<CameraState>((set) => ({
  ...initialCameraState,

  setPermissionStatus: (status) => set({ permissionStatus: status }),
  setDevices: (devices) => set({ devices }),
  setActiveStream: (stream) => set({ activeStream: stream }),
  setActive: (active) => set({ isActive: active }),
  setFacingMode: (mode) => set({ facingMode: mode }),
  setDeviceId: (id) => set({ deviceId: id }),
  setStreamState: (state) => set({ streamState: state }),
  setError: (error) => set({ error }),
  reset: () => set(initialCameraState),
}));

// ============================================================
// Capture Store
// ============================================================

interface CaptureState {
  mode: CaptureMode;
  countdown: number | null;
  isCapturing: boolean;
  capturedImage: string | null;
  processingState: LoadingState;
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
