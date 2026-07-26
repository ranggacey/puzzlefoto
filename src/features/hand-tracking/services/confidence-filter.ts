import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export class HandTrackingConfidenceFilter {
  private lastValidLandmarks: NormalizedLandmark[] | null = null;
  // Maximum allowed movement per frame (squared to avoid Math.sqrt)
  // 0.08 normalized units is about 8% of the screen width per frame (~480% per second at 60fps)
  private MAX_JUMP_SQ = 0.08 * 0.08; 

  filter(landmarks: NormalizedLandmark[]): NormalizedLandmark[] | null {
    if (!this.lastValidLandmarks) {
      this.lastValidLandmarks = landmarks;
      return landmarks;
    }

    // We mainly care about the index finger tip (8) and thumb tip (4) for interaction
    const curr8 = landmarks[8];
    const prev8 = this.lastValidLandmarks[8];
    
    if (curr8 && prev8) {
      const dx = curr8.x - prev8.x;
      const dy = curr8.y - prev8.y;
      const distSq = dx * dx + dy * dy;

      if (distSq > this.MAX_JUMP_SQ) {
        // Impossible jump detected. Reject this frame as a spike/outlier.
        return null;
      }
    }

    // Smooth sudden spikes: Since we rejected impossible jumps, 
    // smaller spikes are handled by the PointerSmoothing. 
    // We just update our last valid state.
    this.lastValidLandmarks = landmarks;
    return landmarks;
  }

  reset() {
    this.lastValidLandmarks = null;
  }
}
