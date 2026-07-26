import { useHandTrackingDiagnostics } from "../store/hand-tracking-diagnostics-store";

class TrackingDiagnosticsService {
  private lossStartTime: number | null = null;
  private confidenceSamples: number[] = [];
  
  // Track continuous metrics to avoid polling the store
  private metrics = {
    losses: 0,
    recoveries: 0,
    totalRecoveryTime: 0,
    longestRecoveryMs: 0,
    averageConfidence: 0,
    lowestConfidence: 1,
    highestConfidence: 0,
    pinchEvents: 0,
    successfulGrabs: 0,
    accidentalReleases: 0,
  };

  private flushMetrics() {
    useHandTrackingDiagnostics.getState().setTrackingMetrics({
      ...this.metrics,
      averageRecoveryDurationMs: this.metrics.recoveries > 0 
        ? Math.round(this.metrics.totalRecoveryTime / this.metrics.recoveries) 
        : 0
    });
  }

  logEvent(type: string, reason?: string) {
    useHandTrackingDiagnostics.getState().addEvent({
      timestamp: performance.now(),
      type,
      reason,
    });
  }

  recordConfidence(confidence: number) {
    this.confidenceSamples.push(confidence);
    if (this.confidenceSamples.length > 60) {
      this.confidenceSamples.shift();
    }
    
    const sum = this.confidenceSamples.reduce((a, b) => a + b, 0);
    this.metrics.averageConfidence = sum / this.confidenceSamples.length;
    this.metrics.lowestConfidence = Math.min(this.metrics.lowestConfidence, confidence);
    this.metrics.highestConfidence = Math.max(this.metrics.highestConfidence, confidence);
    
    // Throttle metric updates for confidence (only once every 10 frames approx)
    if (this.confidenceSamples.length % 10 === 0) {
      this.flushMetrics();
    }
  }

  recordTrackingLoss(reason: string) {
    if (this.lossStartTime === null) {
      this.lossStartTime = performance.now();
      this.metrics.losses++;
      this.logEvent("Tracking Lost", reason);
      this.flushMetrics();
    }
  }

  recordTrackingRecovery() {
    if (this.lossStartTime !== null) {
      const recoveryDuration = performance.now() - this.lossStartTime;
      this.lossStartTime = null;
      
      this.metrics.recoveries++;
      this.metrics.totalRecoveryTime += recoveryDuration;
      this.metrics.longestRecoveryMs = Math.max(this.metrics.longestRecoveryMs, recoveryDuration);
      
      this.logEvent("Tracking Recovered", `Recovered in ${Math.round(recoveryDuration)}ms`);
      this.flushMetrics();
    }
  }

  recordPinchStart() {
    this.metrics.pinchEvents++;
    this.logEvent("Pinch Started");
    this.flushMetrics();
  }

  recordGrab(pieceId: string) {
    this.metrics.successfulGrabs++;
    this.logEvent("Grab", `Piece ${pieceId}`);
    this.flushMetrics();
  }

  recordPinchEnd(pieceId?: string) {
    this.logEvent("Piece Released", pieceId ? `Piece ${pieceId}` : undefined);
  }

  recordAccidentalRelease() {
    this.metrics.accidentalReleases++;
    this.logEvent("Accidental Release");
    this.flushMetrics();
  }
}

export const trackingDiagnostics = new TrackingDiagnosticsService();
