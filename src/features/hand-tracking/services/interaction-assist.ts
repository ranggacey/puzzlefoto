import { DIFFICULTY_PRESETS, PuzzleDifficulty } from "@/features/puzzle/constants/puzzle-difficulty";

export interface InteractionAssistConfig {
  snapRadius: number; // ~40px
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
  private hoverState = new Map<string, number>();

  registerTarget(id: string, element: HTMLElement) {
    this.targets.set(id, element);
  }

  unregisterTarget(id: string) {
    this.targets.delete(id);
    this.hoverState.delete(id);
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

    for (const [id, element] of this.targets.entries()) {
      const rect = element.getBoundingClientRect();
      if (px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom) {
        candidateId = id;
        break;
      }
    }

    const now = performance.now();
    
    // Clean up hover state for pieces no longer being hovered
    for (const id of this.hoverState.keys()) {
      if (id !== candidateId) {
        this.hoverState.delete(id);
      }
    }

    if (candidateId) {
      if (!this.hoverState.has(candidateId)) {
        this.hoverState.set(candidateId, now);
      }
      
      const hoverStartTime = this.hoverState.get(candidateId)!;
      if (now - hoverStartTime > 100) {
        return candidateId;
      }
    }
    
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
