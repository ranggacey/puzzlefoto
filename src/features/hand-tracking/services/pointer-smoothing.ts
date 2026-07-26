import { InteractionConfig } from "../constants/interaction-config";

/**
 * Exponential Moving Average (EMA) implementation to reduce jitter
 * in hand tracking coordinates. Uses Adaptive Smoothing based on speed.
 */
export class PointerSmoothing {
  private currentX: number | null = null;
  private currentY: number | null = null;

  constructor() {}

  /**
   * Applies the EMA filter to the incoming raw coordinates.
   */
  smooth(rawX: number, rawY: number): { x: number; y: number } {
    if (this.currentX === null || this.currentY === null) {
      this.currentX = rawX;
      this.currentY = rawY;
    } else {
      const dx = rawX - this.currentX;
      const dy = rawY - this.currentY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Map distance to a smoothing factor (alpha)
      // distance ~ 0.005 is very slow (jitter), distance ~ 0.05 is fast movement
      const t = Math.max(0, Math.min(1, (dist - 0.005) / 0.045));
      // smoothing represents how much of the OLD value to keep
      // fast movement -> less smoothing (keep less old value) -> 0.45
      // slow movement -> more smoothing (keep more old value) -> 0.82
      const smoothing = InteractionConfig.adaptiveSmoothing.slow * (1 - t) + InteractionConfig.adaptiveSmoothing.fast * t;
      
      this.currentX = (1 - smoothing) * rawX + smoothing * this.currentX;
      this.currentY = (1 - smoothing) * rawY + smoothing * this.currentY;
    }
    
    return { x: this.currentX, y: this.currentY };
  }

  /**
   * Resets the filter state (e.g. when hand tracking is lost).
   */
  reset() {
    this.currentX = null;
    this.currentY = null;
  }
}
