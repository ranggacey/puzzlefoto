/**
 * Exponential Moving Average (EMA) implementation to reduce jitter
 * in hand tracking coordinates.
 */
export class PointerSmoothing {
  private alpha: number;
  private currentX: number | null = null;
  private currentY: number | null = null;

  /**
   * @param smoothingFactor - Value between 0 and 1. 
   * Higher values mean less smoothing (more responsive), 
   * lower values mean more smoothing (less responsive but steadier).
   * Default 0.3 provides a good balance.
   */
  constructor(smoothingFactor: number = 0.3) {
    this.alpha = Math.max(0, Math.min(1, smoothingFactor));
  }

  /**
   * Applies the EMA filter to the incoming raw coordinates.
   */
  smooth(rawX: number, rawY: number): { x: number; y: number } {
    if (this.currentX === null || this.currentY === null) {
      this.currentX = rawX;
      this.currentY = rawY;
    } else {
      this.currentX = this.alpha * rawX + (1 - this.alpha) * this.currentX;
      this.currentY = this.alpha * rawY + (1 - this.alpha) * this.currentY;
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
