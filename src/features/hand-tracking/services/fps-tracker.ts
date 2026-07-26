import { FpsMetrics } from "../store/hand-tracking-diagnostics-store";

export class FpsTracker {
  private frameTimes: number[] = [];
  private readonly maxFrames = 60;
  private minFps = Infinity;
  private maxFps = 0;
  private lastUpdateTime = 0;

  recordFrame(timestamp: number) {
    this.frameTimes.push(timestamp);
    if (this.frameTimes.length > this.maxFrames) {
      this.frameTimes.shift();
    }
  }

  getMetrics(): FpsMetrics | null {
    if (this.frameTimes.length < 2) return null;

    const first = this.frameTimes[0];
    const last = this.frameTimes[this.frameTimes.length - 1];
    const duration = last - first;

    if (duration === 0) return null;

    const currentFps = 1000 / (this.frameTimes[this.frameTimes.length - 1] - this.frameTimes[this.frameTimes.length - 2]);
    const averageFps = (this.frameTimes.length - 1) / (duration / 1000);

    // Only update min/max if we have a reasonable sample size
    if (this.frameTimes.length >= this.maxFrames / 2) {
      this.minFps = Math.min(this.minFps, currentFps);
      this.maxFps = Math.max(this.maxFps, currentFps);
    }

    return {
      current: Math.round(currentFps),
      average: Math.round(averageFps),
      min: this.minFps === Infinity ? 0 : Math.round(this.minFps),
      max: Math.round(this.maxFps),
    };
  }

  // Helper to throttle store updates (e.g., update store every 250ms)
  shouldUpdateStore(timestamp: number): boolean {
    if (timestamp - this.lastUpdateTime > 250) {
      this.lastUpdateTime = timestamp;
      return true;
    }
    return false;
  }
}
