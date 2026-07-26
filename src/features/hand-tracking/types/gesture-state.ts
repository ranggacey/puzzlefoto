export interface GestureState {
  hovering: boolean;
  hoveredPieceId?: string;
  pinching: boolean;
  phase: "idle" | "hover" | "pinch-start" | "pinching" | "pinch-end";
}

// Simple hit testing interface so the recognizer remains framework-agnostic.
export interface HitTester {
  hitTest(x: number, y: number): string | undefined;
}

export interface NormalizedPointerEvent {
  type: "pointerMove" | "pointerDown" | "pointerUp";
  x: number;
  y: number;
  hoveredPieceId?: string;
}
