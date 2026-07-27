export type InteractionState = 
  | "Idle" 
  | "Hover" 
  | "Hover Stable"
  | "Auto Select" 
  | "Selected" 
  | "Hover Target" 
  | "Pinch Start"
  | "Pinch Hold"
  | "Pinch End"
  | "Swap Requested" 
  | "Swap Executed" 
  | "Selection Cleared";

interface TimelineEvent {
  timeOffset: number;
  message: string;
}

class InteractionLoggerService {
  private interactionId: number = 0;
  private currentInteractionStartTime: number = 0;
  private timeline: TimelineEvent[] = [];
  public currentState: InteractionState = "Idle";
  
  public startInteraction() {
    this.interactionId++;
    this.currentInteractionStartTime = performance.now();
    this.timeline = [];
    this.currentState = "Idle";
    console.log(`\n================================`);
    console.log(`[Interaction #${this.interactionId}] STARTED`);
    console.log(`================================`);
  }

  public endInteraction(summary: string) {
    console.log(`\n[Interaction #${this.interactionId}] TIMELINE:`);
    this.timeline.forEach(event => {
      console.log(`${event.timeOffset}ms ${event.message}`);
    });
    console.log(`\n[Interaction #${this.interactionId}] SUMMARY:`);
    console.log(summary);
    console.log(`================================\n`);
  }

  public logDecision(subsystem: string, action: string, reasonDetails: string[]) {
    console.log(`\n[Interaction #${this.interactionId}][${subsystem}]`);
    console.log(`${action}`);
    console.log(`Reason:`);
    reasonDetails.forEach(detail => console.log(detail));
  }

  public logState(subsystem: string, data: Record<string, unknown>) {
    console.log(`\n[Interaction #${this.interactionId}][${subsystem}]`);
    for (const [key, value] of Object.entries(data)) {
      console.log(`${key}: ${JSON.stringify(value)}`);
    }
  }

  public logTransition(subsystem: string, from: InteractionState, to: InteractionState) {
    console.log(`\n[Interaction #${this.interactionId}][${subsystem}] Transition`);
    console.log(`${from}\n↓\n${to}`);
    this.assertStateMachine(to);
  }
  
  public recordTimelineEvent(message: string) {
    if (this.currentInteractionStartTime === 0) return;
    const timeOffset = Math.round(performance.now() - this.currentInteractionStartTime);
    this.timeline.push({ timeOffset, message });
  }

  public assertInvariant(name: string, condition: boolean) {
    console.log(`\n[Interaction #${this.interactionId}] Invariant`);
    console.log(`${name}`);
    if (condition) {
      console.log(`PASS`);
    } else {
      console.warn(`FAIL`);
      console.warn(`STATE MACHINE VIOLATION - Invariant failed: ${name}`);
    }
  }

  private assertStateMachine(newState: InteractionState) {
    // Valid transitions
    const validTransitions: Record<InteractionState, InteractionState[]> = {
      "Idle": ["Hover", "Hover Stable", "Selected", "Selection Cleared"],
      "Hover": ["Hover Stable", "Idle", "Selected"],
      "Hover Stable": ["Auto Select", "Idle", "Hover", "Selected"],
      "Auto Select": ["Selected", "Idle"],
      "Selected": ["Hover Target", "Selection Cleared", "Idle"],
      "Hover Target": ["Pinch Start", "Selection Cleared", "Selected", "Idle"],
      "Pinch Start": ["Pinch Hold", "Pinch End", "Selection Cleared", "Hover Target", "Idle"],
      "Pinch Hold": ["Pinch End", "Hover Target", "Selection Cleared", "Idle"],
      "Pinch End": ["Swap Requested", "Hover Target", "Selection Cleared", "Idle"],
      "Swap Requested": ["Swap Executed", "Selection Cleared", "Idle"],
      "Swap Executed": ["Selection Cleared", "Idle"],
      "Selection Cleared": ["Idle"],
    };

    const allowed = validTransitions[this.currentState] || [];
    if (!allowed.includes(newState) && newState !== "Idle") {
      console.warn(`\nSTATE MACHINE VIOLATION`);
      console.warn(`Expected one of: ${allowed.join(", ")}`);
      console.warn(`Received: ${newState}`);
      console.warn(`Reason: Unexpected state transition.`);
    }
    
    this.currentState = newState;
    this.recordTimelineEvent(newState);
  }
  
  // Public accessor for development overlay
  public getMetrics() {
    return {
      interactionId: this.interactionId,
      currentState: this.currentState,
      timelineCount: this.timeline.length,
      lastEvent: this.timeline[this.timeline.length - 1]?.message || "None",
    };
  }
}

export const InteractionLogger = new InteractionLoggerService();
