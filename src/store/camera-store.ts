import { create } from "zustand";
import type { LoadingState, CaptureMode, CapturedPhoto } from "@/types";
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
  mode: CaptureMode | null;
  isCapturing: boolean;
  capturedPhotos: CapturedPhoto[];
  processingState: LoadingState;
  backgroundUrl: string | null;

  // Actions
  setMode: (mode: CaptureMode | null) => void;
  setCapturing: (capturing: boolean) => void;
  addPhoto: (photo: CapturedPhoto) => void;
  removePhoto: (id: string) => void;
  clearPhotos: () => void;
  setProcessingState: (state: LoadingState) => void;
  setBackgroundUrl: (url: string | null) => void;
  reset: () => void;
}

const initialCaptureState = {
  mode: null,
  isCapturing: false,
  capturedPhotos: [],
  processingState: "idle" as const,
  backgroundUrl: null,
};

export const useCaptureStore = create<CaptureState>((set) => ({
  ...initialCaptureState,

  setMode: (mode) => set({ mode }),
  setCapturing: (capturing) => set({ isCapturing: capturing }),
  addPhoto: (photo) => set((state) => ({ capturedPhotos: [...state.capturedPhotos, photo] })),
  removePhoto: (id) => set((state) => ({ 
    capturedPhotos: state.capturedPhotos.filter((p) => p.id !== id) 
  })),
  clearPhotos: () => set({ capturedPhotos: [] }),
  setProcessingState: (state) => set({ processingState: state }),
  setBackgroundUrl: (url) => set({ backgroundUrl: url }),
  reset: () => set(initialCaptureState),
}));
