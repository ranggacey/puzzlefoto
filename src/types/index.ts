// ============================================================
// Shared type definitions for Vision Puzzle
// ============================================================

/** Application-wide view/route identifiers */
export type AppView = "landing" | "photo-booth" | "puzzle";

/** Generic loading states for async operations */
export type LoadingState = "idle" | "loading" | "success" | "error";

/** Capture mode options for the Photo Booth */
export enum CaptureMode {
  SINGLE = "SINGLE",
  GRID_2X2 = "GRID_2X2",
  FILM_STRIP = "FILM_STRIP",
}

/** Data model for a single captured photo */
export interface CapturedPhoto {
  id: string;
  image: string; // Data URL or Blob URL
  timestamp: number;
  width: number;
  height: number;
}

/** Configuration for a specific capture mode */
export interface CaptureModeConfig {
  id: CaptureMode;
  title: string;
  description: string;
  requiredPhotos: number;
  aspectRatio: string;
  previewLayout: "single" | "grid" | "filmStrip";
  allowMirror: boolean;
  allowBackgroundRemoval: boolean;
}

/** Gesture types recognized by the hand tracking system */
export type GestureType =
  | "none"
  | "point"
  | "pinch"
  | "grab"
  | "open-palm"
  | "thumbs-up";



/** 2D coordinate point */
export interface Point {
  x: number;
  y: number;
}

/** Dimensions for canvas/image rendering */
export interface Dimensions {
  width: number;
  height: number;
}
