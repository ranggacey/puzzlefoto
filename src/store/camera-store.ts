import { create } from "zustand";
import type { LoadingState, CaptureMode, CapturedPhoto } from "@/types";

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
