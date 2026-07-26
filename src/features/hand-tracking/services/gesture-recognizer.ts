import type { HandState } from "../types/hand-state";
import type { GestureState, HitTester, NormalizedPointerEvent } from "../types/gesture-state";

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
  private PINCH_THRESHOLD = 0.08; // Normalized distance threshold
  private DEBOUNCE_MS = 60; // 60ms debounce for stability

  private onEvent?: EventCallback;
  private hitTester?: HitTester;

  setCallbacks(onEvent: EventCallback, hitTester: HitTester) {
    this.onEvent = onEvent;
    this.hitTester = hitTester;
  }

  process(handState: HandState, timestamp: number): GestureState {
    if (!handState.detected || handState.landmarks.length < 9) {
      if (this.state.pinching) {
        this.emit("pointerUp", handState.pointer.x, handState.pointer.y);
      }
      this.state = { hovering: false, pinching: false, phase: "idle" };
      this.isPhysicallyPinching = false;
      return this.state;
    }

    const pointer = handState.pointer;
    const hoveredPieceId = this.hitTester?.hitTest(pointer.x, pointer.y);
    const hovering = !!hoveredPieceId;

    // Landmark 4: Thumb tip, Landmark 8: Index tip
    const thumb = handState.landmarks[4];
    const index = handState.landmarks[8];
    const dx = thumb.x - index.x;
    const dy = thumb.y - index.y;
    // Normalized distance
    const distance = Math.sqrt(dx * dx + dy * dy);
    const currentPhysicalPinch = distance < this.PINCH_THRESHOLD;

    if (currentPhysicalPinch && !this.isPhysicallyPinching) {
      this.pinchStartTime = timestamp;
      this.isPhysicallyPinching = true;
    } else if (!currentPhysicalPinch && this.isPhysicallyPinching) {
      this.pinchEndTime = timestamp;
      this.isPhysicallyPinching = false;
    }

    let { phase, pinching } = this.state;

    if (this.isPhysicallyPinching && !pinching) {
      if (timestamp - this.pinchStartTime >= this.DEBOUNCE_MS) {
        pinching = true;
        phase = "pinch-start";
        this.emit("pointerDown", pointer.x, pointer.y, hoveredPieceId);
      }
    } else if (!this.isPhysicallyPinching && pinching) {
      if (timestamp - this.pinchEndTime >= this.DEBOUNCE_MS) {
        pinching = false;
        phase = "pinch-end";
        this.emit("pointerUp", pointer.x, pointer.y, hoveredPieceId);
      }
    } else if (pinching) {
      phase = "pinching";
      this.emit("pointerMove", pointer.x, pointer.y, hoveredPieceId);
    } else {
      phase = hovering ? "hover" : "idle";
      this.emit("pointerMove", pointer.x, pointer.y, hoveredPieceId);
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
