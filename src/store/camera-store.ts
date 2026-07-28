import { create } from "zustand";
import type { LoadingState, CaptureMode, CapturedPhoto } from "@/types";

// ============================================================
// Capture Store
// ============================================================

const STORAGE_KEY = "puzzlefoto_captured_photos";

function loadPhotos(): CapturedPhoto[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePhotos(photos: CapturedPhoto[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  } catch {}
}

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
  capturedPhotos: loadPhotos(),
  processingState: "idle" as const,
  backgroundUrl: null,
};

export const useCaptureStore = create<CaptureState>((set) => ({
  ...initialCaptureState,

  setMode: (mode) => set({ mode }),
  setCapturing: (capturing) => set({ isCapturing: capturing }),
  addPhoto: (photo) => set((state) => {
    const capturedPhotos = [...state.capturedPhotos, photo];
    savePhotos(capturedPhotos);
    return { capturedPhotos };
  }),
  removePhoto: (id) => set((state) => {
    const capturedPhotos = state.capturedPhotos.filter((p) => p.id !== id);
    savePhotos(capturedPhotos);
    return { capturedPhotos };
  }),
  clearPhotos: () => {
    savePhotos([]);
    set({ capturedPhotos: [] });
  },
  setProcessingState: (state) => set({ processingState: state }),
  setBackgroundUrl: (url) => set({ backgroundUrl: url }),
  reset: () => set(initialCaptureState),
}));
