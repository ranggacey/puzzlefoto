import type { HandState } from "../types/hand-state";
import type { GestureState, HitTester, NormalizedPointerEvent } from "../types/gesture-state";
import { InteractionConfig } from "../constants/interaction-config";

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

  process(handState: HandState, timestamp: number): GestureState {
    if (!handState.detected || handState.landmarks.length < 9) {
      if (this.state.pinching) {
        if (this.trackingLostTime === 0) {
          this.trackingLostTime = timestamp;
        } else if (timestamp - this.trackingLostTime > InteractionConfig.dragPersistenceMs) {
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
    
    // Pinch Hysteresis
    if (!this.isPhysicallyPinching && distance < InteractionConfig.pinchStartDistance) {
      this.pinchStartTime = timestamp;
      this.isPhysicallyPinching = true;
    } else if (this.isPhysicallyPinching && distance > InteractionConfig.pinchEndDistance) {
      this.pinchEndTime = timestamp;
      this.isPhysicallyPinching = false;
    }

    let { phase, pinching } = this.state;

    // We still use 60ms hardcoded debounce for the physical start/end transition stability
    const DEBOUNCE_MS = 60;

    if (this.isPhysicallyPinching && !pinching) {
      if (timestamp - this.pinchStartTime >= DEBOUNCE_MS) {
        pinching = true;
        phase = "pinch-start";
        this.emit("pointerDown", pointer.x, pointer.y, hoveredPieceId);
      }
    } else if (!this.isPhysicallyPinching && pinching) {
      if (timestamp - this.pinchEndTime >= DEBOUNCE_MS) {
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
