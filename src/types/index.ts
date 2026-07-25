// ============================================================
// Shared type definitions for Vision Puzzle
// ============================================================

/** Application-wide view/route identifiers */
export type AppView = "landing" | "photo-booth" | "puzzle";

/** Generic loading states for async operations */
export type LoadingState = "idle" | "loading" | "success" | "error";

/** Capture mode options for the Photo Booth */
export type CaptureMode = "original" | "virtual-background" | "portrait";

/** Gesture types recognized by the hand tracking system */
export type GestureType =
  | "none"
  | "point"
  | "pinch"
  | "grab"
  | "open-palm"
  | "thumbs-up";

/** Puzzle piece representation */
export interface PuzzlePiece {
  id: number;
  currentRow: number;
  currentCol: number;
  correctRow: number;
  correctCol: number;
  isPlaced: boolean;
}

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
