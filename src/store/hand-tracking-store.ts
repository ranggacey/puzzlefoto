import { create } from "zustand";
import type { GestureType, Point } from "@/types";

// ============================================================
// Hand Tracking Store (shell for future implementation)
// ============================================================

interface HandTrackingState {
  /** Whether hand detection is active */
  isDetecting: boolean;
  /** Whether a hand is currently detected in frame */
  isHandDetected: boolean;
  /** Current recognized gesture */
  gesture: GestureType;
  /** Detection confidence (0-1) */
  confidence: number;
  /** Cursor position derived from index finger tip */
  cursorPosition: Point | null;
  /** Whether the pinch gesture is active */
  isPinching: boolean;
  /** Model loading state */
  isModelLoaded: boolean;

  // Actions
  setDetecting: (detecting: boolean) => void;
  setHandDetected: (detected: boolean) => void;
  setGesture: (gesture: GestureType) => void;
  setConfidence: (confidence: number) => void;
  setCursorPosition: (position: Point | null) => void;
  setPinching: (pinching: boolean) => void;
  setModelLoaded: (loaded: boolean) => void;
  reset: () => void;
}

const initialHandTrackingState = {
  isDetecting: false,
  isHandDetected: false,
  gesture: "none" as const,
  confidence: 0,
  cursorPosition: null,
  isPinching: false,
  isModelLoaded: false,
};

export const useHandTrackingStore = create<HandTrackingState>((set) => ({
  ...initialHandTrackingState,

  setDetecting: (detecting) => set({ isDetecting: detecting }),
  setHandDetected: (detected) => set({ isHandDetected: detected }),
  setGesture: (gesture) => set({ gesture }),
  setConfidence: (confidence) => set({ confidence }),
  setCursorPosition: (position) => set({ cursorPosition: position }),
  setPinching: (pinching) => set({ isPinching: pinching }),
  setModelLoaded: (loaded) => set({ isModelLoaded: loaded }),
  reset: () => set(initialHandTrackingState),
}));
