import type { HandState } from "../types/hand-state";
import type { GestureState, HitTester, NormalizedPointerEvent } from "../types/gesture-state";
import { InteractionConfig } from "../constants/interaction-config";
import { trackingDiagnostics } from "./diagnostics-service";
import { InteractionLogger } from "@/lib/debug/interaction-logger";

type EventCallback = (event: NormalizedPointerEvent) => void;

export class GestureRecognizer {
  private state: GestureState = {
    hovering: false,
    pinching: false,
    phase: "idle",
  };

  private pinchStartTime = 0;
  private pinchEndTime = 0;
  private isPhysicallyPinching = false;
  private trackingLostTime = 0;
  private lastPointer = { x: 0, y: 0 };

  private onEvent?: EventCallback;
  private hitTester?: HitTester;

  setCallbacks(onEvent: EventCallback, hitTester: HitTester) {
    this.onEvent = onEvent;
    this.hitTester = hitTester;
  }

  getIsPinching(): boolean {
    return this.state.pinching;
  }

  process(handState: HandState, timestamp: number): GestureState {
    if (!handState.detected || handState.landmarks.length < 9) {
      if (this.state.pinching) {
        if (this.trackingLostTime === 0) {
          this.trackingLostTime = timestamp;
        } else if (timestamp - this.trackingLostTime > InteractionConfig.dragPersistenceMs) {
          trackingDiagnostics.recordAccidentalRelease();
          this.emit("pointerUp", this.lastPointer.x, this.lastPointer.y, this.state.hoveredPieceId);
          this.state = { hovering: false, pinching: false, phase: "idle" };
          this.isPhysicallyPinching = false;
        }
      } else {
        this.state = { hovering: false, pinching: false, phase: "idle" };
        this.isPhysicallyPinching = false;
        this.trackingLostTime = 0;
      }
      return this.state;
    }

    this.trackingLostTime = 0;
    const pointer = handState.pointer;
    this.lastPointer = pointer;
    
    const hoveredPieceId = this.hitTester?.hitTest(pointer.x, pointer.y);
    const hovering = !!hoveredPieceId;

    // Landmark 4: Thumb tip, Landmark 8: Index tip
    const thumb = handState.landmarks[4];
    const index = handState.landmarks[8];
    const dx = thumb.x - index.x;
    const dy = thumb.y - index.y;
    // Normalized distance
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    let { phase, pinching } = this.state;
    const DEBOUNCE_MS = 60;

    // Pinch Hysteresis
    if (!this.isPhysicallyPinching && distance < InteractionConfig.pinchStartDistance) {
      this.pinchStartTime = timestamp;
      this.isPhysicallyPinching = true;
      InteractionLogger.logDecision("GestureRecognizer", "Pinch Candidate Start", [
        `✔ Distance (${distance.toFixed(3)}) < ${InteractionConfig.pinchStartDistance}`,
        `⏳ Waiting for debounce (${DEBOUNCE_MS}ms)...`
      ]);
    } else if (this.isPhysicallyPinching && distance > InteractionConfig.pinchEndDistance) {
      const duration = timestamp - this.pinchStartTime;
      this.pinchEndTime = timestamp;
      this.isPhysicallyPinching = false;
      
      if (!pinching) {
        // Cancelled before being accepted
        InteractionLogger.logDecision("GestureRecognizer", "Pinch Cancelled", [
          `✖ Reason: Distance (${distance.toFixed(3)}) exceeded threshold (${InteractionConfig.pinchEndDistance}) before debounce`,
          `⏱ Duration: ${Math.round(duration)}ms / ${DEBOUNCE_MS}ms`
        ]);
      } else {
        InteractionLogger.logDecision("GestureRecognizer", "Pinch End Candidate", [
          `✔ Distance (${distance.toFixed(3)}) > ${InteractionConfig.pinchEndDistance}`,
          `⏳ Waiting for release confirmation...`
        ]);
      }
    }

    if (this.isPhysicallyPinching && !pinching) {
      const duration = timestamp - this.pinchStartTime;
      if (duration >= DEBOUNCE_MS) {
        pinching = true;
        phase = "pinch-start";
        InteractionLogger.logDecision("GestureRecognizer", "Pinch Accepted", [
          `✔ Distance: ${distance.toFixed(3)}`,
          `✔ Debounce complete`,
          `⏱ Final Duration: ${Math.round(duration)}ms`
        ]);
        trackingDiagnostics.recordPinchStart();
        if (hoveredPieceId) {
          trackingDiagnostics.recordGrab(hoveredPieceId);
        }
        this.emit("pointerDown", pointer.x, pointer.y, hoveredPieceId);
      } else {
        // We are currently in candidate state, waiting for debounce
        InteractionLogger.logState("GestureRecognizer.PinchCandidate", {
          distance: Number(distance.toFixed(3)),
          threshold: InteractionConfig.pinchEndDistance,
          durationMs: Math.round(duration),
          debounceTargetMs: DEBOUNCE_MS
        });
      }
    } else if (!this.isPhysicallyPinching && pinching) {
      if (timestamp - this.pinchEndTime >= InteractionConfig.releaseConfirmationMs) {
        pinching = false;
        phase = "pinch-end";
        InteractionLogger.logDecision("GestureRecognizer", "Pinch Release Accepted", [
          `✔ Distance above threshold`,
          `✔ Release confirmation complete`
        ]);
        trackingDiagnostics.recordPinchEnd(this.state.hoveredPieceId);
        this.emit("pointerUp", pointer.x, pointer.y, hoveredPieceId);
      }
    } else if (pinching) {
      phase = "pinching";
      this.emit("pointerMove", pointer.x, pointer.y, hoveredPieceId);
    } else {
      phase = hovering ? "hover" : "idle";
      this.emit("pointerMove", pointer.x, pointer.y, hoveredPieceId);
    }

    const mapPhaseToState = (p: string) => {
      if (p === "idle") return "Idle";
      if (p === "hover") return "Hover";
      if (p === "pinch-start") return "Pinch Start";
      if (p === "pinching") return "Pinch Hold";
      if (p === "pinch-end") return "Pinch End";
      return "Idle";
    };

    if (this.state.phase !== phase) {
      // Don't log spammy idle/hover transitions unless interacting
      if (phase === "pinch-start" || phase === "pinching" || phase === "pinch-end") {
        const fromState = mapPhaseToState(this.state.phase) as import("@/lib/debug/interaction-logger").InteractionState;
        const toState = mapPhaseToState(phase) as import("@/lib/debug/interaction-logger").InteractionState;
        InteractionLogger.logTransition("GestureRecognizer", fromState, toState);
      }
    }

    this.state = {
      hovering,
      hoveredPieceId,
      pinching,
      phase,
    };

    return this.state;
  }

  private emit(
    type: "pointerMove" | "pointerDown" | "pointerUp",
    x: number,
    y: number,
    hoveredPieceId?: string
  ) {
    if (this.onEvent) {
      this.onEvent({ type, x, y, hoveredPieceId });
    }
  }
}
