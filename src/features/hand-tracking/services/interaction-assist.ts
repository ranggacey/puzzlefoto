import { DIFFICULTY_PRESETS, PuzzleDifficulty } from "@/features/puzzle/constants/puzzle-difficulty";
import { InteractionLogger } from "@/lib/debug/interaction-logger";
import { InteractionConfig } from "@/features/hand-tracking/constants/interaction-config";

export interface InteractionAssistConfig {
  snapRadius: number; // ~40px
}

export interface HitTestEvaluation {
  px: number;
  py: number;
  candidates: {
    pieceId: string;
    inside: boolean;
    rect: DOMRect;
    logicalRect: DOMRect;
  }[];
  chosenId: string | null;
  browserTargetId: string | null;
}

export class InteractionAssistService {
  private config: InteractionAssistConfig = {
    snapRadius: 40,
  };

  private getBoardRect: () => DOMRect | null = () => null;
  private difficulty: PuzzleDifficulty = "easy";
  
  // Generic target registry
  private targets = new Map<string, HTMLElement>();
  
  // Hysteresis for hovering
  private hoverState = new Map<string, { startTime: number; lastSeenTime: number }>();

  // Diagnostic state for Spatial Debug Overlay
  private lastHitTest: HitTestEvaluation | null = null;

  public getTargets(): Map<string, HTMLElement> {
    return this.targets;
  }

  public getBoardRectProp(): DOMRect | null {
    return this.getBoardRect();
  }

  public getLastHitTest(): HitTestEvaluation | null {
    return this.lastHitTest;
  }

  registerTarget(id: string, element: HTMLElement) {
    this.targets.set(id, element);
    const rect = element.getBoundingClientRect();
    InteractionLogger.logState("Registry", {
      action: "Register",
      id,
      rect: `L:${Math.round(rect.left)} R:${Math.round(rect.right)} T:${Math.round(rect.top)} B:${Math.round(rect.bottom)}`,
      connected: element.isConnected,
      size: this.targets.size
    });
  }

  unregisterTarget(id: string) {
    this.targets.delete(id);
    this.hoverState.delete(id);
    InteractionLogger.logState("Registry", {
      action: "Unregister",
      id,
      size: this.targets.size
    });
  }

  updateContext(getBoardRect: () => DOMRect | null, difficulty: PuzzleDifficulty) {
    this.getBoardRect = getBoardRect;
    this.difficulty = difficulty;
  }

  // Smart Hit Tester using deterministic bounding boxes
  hitTest(x: number, y: number): string | undefined {
    const px = x * window.innerWidth;
    const py = y * window.innerHeight;

    let candidateId: string | undefined = undefined;
    
    // Log registry before hit test
    const registryDump = Array.from(this.targets.entries()).map(([id, el]) => {
      const rect = el.getBoundingClientRect();
      return `${id} (connected:${el.isConnected}) [${Math.round(rect.width)}x${Math.round(rect.height)}]`;
    });
    
    InteractionLogger.logState("HitTest", {
      pointer: `(${Math.round(px)}, ${Math.round(py)})`,
      registrySize: this.targets.size,
      registry: registryDump
    });

    const evaluation: HitTestEvaluation = {
      px,
      py,
      candidates: [],
      chosenId: null,
      browserTargetId: null,
    };

    // Calculate Browser Ground Truth
    if (typeof document !== 'undefined') {
      const browserTarget = document.elementFromPoint(px, py);
      if (browserTarget) {
        const pieceIdAttr = browserTarget.closest('[data-piece-id]')?.getAttribute('data-piece-id');
        if (pieceIdAttr) {
          evaluation.browserTargetId = pieceIdAttr;
        }
      }
    }

    const candidatesLog: string[] = [];

    for (const [id, element] of this.targets.entries()) {
      const rect = element.getBoundingClientRect();
      
      const scale = InteractionConfig.logicalHitboxScale;
      const wInset = (rect.width * (1 - scale)) / 2;
      const hInset = (rect.height * (1 - scale)) / 2;
      
      const logicalRect = new DOMRect(
        rect.left + wInset,
        rect.top + hInset,
        rect.width * scale,
        rect.height * scale
      );
      
      const inside = (px >= logicalRect.left && px <= logicalRect.right && py >= logicalRect.top && py <= logicalRect.bottom);
      
      evaluation.candidates.push({ pieceId: id, inside, rect, logicalRect });
      candidatesLog.push(`${id} - inside=${inside}`);
      
      if (inside && !candidateId) {
        candidateId = id;
        // Do not break here because we want to evaluate all candidates for the debug overlay
      }
    }
    
    InteractionLogger.logDecision("HitTest", "Candidates Evaluated", candidatesLog);

    const now = performance.now();
    
    if (candidateId) {
      const existing = this.hoverState.get(candidateId);
      if (existing) {
        existing.lastSeenTime = now;
      } else {
        this.hoverState.set(candidateId, { startTime: now, lastSeenTime: now });
      }
    }

    // Clean up expired hover states and determine the stable candidate
    let bestCandidate: string | undefined;
    let maxLastSeen = 0;

    for (const [id, state] of this.hoverState.entries()) {
      if (now - state.lastSeenTime > 150) { // 150ms dropout tolerance
        this.hoverState.delete(id);
      } else {
        if (state.lastSeenTime >= maxLastSeen && now - state.startTime > 100) {
          bestCandidate = id;
          maxLastSeen = state.lastSeenTime;
        }
      }
    }

    if (bestCandidate) {
      const state = this.hoverState.get(bestCandidate)!;
      InteractionLogger.logDecision("HitTest", "Chosen Piece", [
        `✔ ${bestCandidate}`,
        `✔ Hover stability satisfied (>100ms)`,
        ...(candidateId !== bestCandidate ? [`ℹ Using persistence (lost for ${Math.round(now - state.lastSeenTime)}ms)`] : [])
      ]);
      evaluation.chosenId = bestCandidate;
      this.lastHitTest = evaluation;
      return bestCandidate;
    } else {
      if (candidateId) {
        const state = this.hoverState.get(candidateId)!;
        InteractionLogger.logDecision("HitTest", "Piece Candidate Ignored", [
          `✖ ${candidateId}`,
          `✖ Hover stability NOT satisfied (${Math.round(now - state.startTime)}ms < 100ms)`
        ]);
      } else {
        InteractionLogger.logDecision("HitTest", "No Piece Chosen", [
          `✖ Pointer outside all bounds`
        ]);
      }
    }
    
    this.lastHitTest = evaluation;
    
    return undefined;
  }



  // Evaluates adaptive drop snap target
  getAdaptiveDropTarget(x: number, y: number): number | null {
    const boardRect = this.getBoardRect();
    if (!boardRect) return null;
    
    const px = x * boardRect.width;
    const py = y * boardRect.height;
    
    const { columns, rows } = DIFFICULTY_PRESETS[this.difficulty];
    const slotWidth = boardRect.width / columns;
    const slotHeight = boardRect.height / rows;
    
    let closestSlotIndex = null;
    let minDistance = Infinity;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const slotCenterX = (col + 0.5) * slotWidth;
        const slotCenterY = (row + 0.5) * slotHeight;
        
        const dx = px - slotCenterX;
        const dy = py - slotCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestSlotIndex = row * columns + col;
        }
      }
    }
    
    // Snap automatically if within snap radius, otherwise return closest slot 
    // Wait, the prompt says "If inside the snap radius... snap automatically. Otherwise: return the piece to its original slot."
    if (minDistance <= this.config.snapRadius) {
      return closestSlotIndex;
    }
    return null;
  }

}

export const interactionAssist = new InteractionAssistService();
