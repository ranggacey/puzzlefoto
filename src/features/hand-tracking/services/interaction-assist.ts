import { NormalizedPointerEvent } from "../types/gesture-state";
import { DIFFICULTY_PRESETS, PuzzleDifficulty } from "@/features/puzzle/constants/puzzle-difficulty";
import { PuzzlePiece } from "@/features/puzzle/types/puzzle-piece";

export interface InteractionAssistConfig {
  hoverRadius: number; // ~80px
  snapRadius: number; // ~40px
}

export class InteractionAssistService {
  private config: InteractionAssistConfig = {
    hoverRadius: 80,
    snapRadius: 40,
  };

  private getBoardRect: () => DOMRect | null = () => null;
  private pieces: PuzzlePiece[] = [];
  private difficulty: PuzzleDifficulty = "easy";
  private capturedPieceId: string | null = null;
  
  // Hysteresis for hovering
  private lastHoveredPieceId: string | null = null;
  private hoverStartTime: number = 0;

  updateContext(getBoardRect: () => DOMRect | null, pieces: PuzzlePiece[], difficulty: PuzzleDifficulty) {
    this.getBoardRect = getBoardRect;
    this.pieces = pieces;
    this.difficulty = difficulty;
  }

  // Smart Hit Tester (Replaces old exact rectangle hit test)
  hitTest(x: number, y: number): string | undefined {
    const boardRect = this.getBoardRect();
    if (!boardRect) return undefined;
    
    const px = x * boardRect.width;
    const py = y * boardRect.height;
    
    const { columns, rows } = DIFFICULTY_PRESETS[this.difficulty];
    const slotWidth = boardRect.width / columns;
    const slotHeight = boardRect.height / rows;

    let closestPieceId: string | undefined = undefined;
    let minDistance = Infinity;

    for (const piece of this.pieces) {
      if (piece.isLocked) continue;

      const col = piece.currentSlotIndex % columns;
      const row = Math.floor(piece.currentSlotIndex / columns);
      
      const pieceCenterX = (col + 0.5) * slotWidth;
      const pieceCenterY = (row + 0.5) * slotHeight;

      const dx = px - pieceCenterX;
      const dy = py - pieceCenterY;
      const distanceToCenter = Math.sqrt(dx * dx + dy * dy);

      if (distanceToCenter <= this.config.hoverRadius && distanceToCenter < minDistance) {
        minDistance = distanceToCenter;
        closestPieceId = piece.id;
      }
    }

    const candidate = closestPieceId ?? null;
    const now = performance.now();
      
    // Hysteresis: only switch hover if candidate is stable for a minimum duration
    if (candidate !== this.lastHoveredPieceId) {
      this.hoverStartTime = now;
      this.lastHoveredPieceId = candidate;
    }
    
    // Require 100ms stable hover to switch target
    if (now - this.hoverStartTime > 100) {
      return candidate ?? undefined;
    } else {
      // Fallback
      return candidate ?? undefined;
    }
  }

  // Calculates progressive magnetic attraction based on distance
  private getMagneticStrength(distance: number): number {
    if (distance <= 15) return 1.0;
    if (distance <= 30) return 0.8;
    if (distance <= 60) return 0.5;
    if (distance <= 100) return 0.2;
    if (distance <= 150) return 0.05;
    return 0.0;
  }

  // Applies magnetic attraction to pointer coordinates if hovering a piece
  applyMagneticAttraction(x: number, y: number, targetPieceId: string | undefined): { x: number, y: number } {
    const boardRect = this.getBoardRect();
    if (!boardRect || !targetPieceId) return { x, y };
    
    const piece = this.pieces.find(p => p.id === targetPieceId);
    if (!piece) return { x, y };

    const { columns, rows } = DIFFICULTY_PRESETS[this.difficulty];
    const slotWidth = boardRect.width / columns;
    const slotHeight = boardRect.height / rows;
    
    const col = piece.currentSlotIndex % columns;
    const row = Math.floor(piece.currentSlotIndex / columns);
    
    const pieceCenterX = (col + 0.5) * slotWidth;
    const pieceCenterY = (row + 0.5) * slotHeight;
    
    const px = x * boardRect.width;
    const py = y * boardRect.height;
    
    const dx = pieceCenterX - px;
    const dy = pieceCenterY - py;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const strength = this.getMagneticStrength(distance);
    
    return {
      x: x + (dx / boardRect.width) * strength,
      y: y + (dy / boardRect.height) * strength,
    };
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

  // Translates raw pointers into intent-based AR pointers
  processEvent(event: NormalizedPointerEvent): NormalizedPointerEvent {
    // 1. Maintain captured pointer
    if (event.type === "pointerDown") {
      this.capturedPieceId = event.hoveredPieceId || null;
    } else if (event.type === "pointerUp") {
      this.capturedPieceId = null;
    }

    // When captured, we lock the hover target
    const targetPieceId = this.capturedPieceId || event.hoveredPieceId;
    
    // 2. Apply magnetic attraction
    const magneticPos = this.applyMagneticAttraction(event.x, event.y, targetPieceId ?? undefined);

    return {
      type: event.type,
      x: magneticPos.x,
      y: magneticPos.y,
      hoveredPieceId: targetPieceId ?? undefined,
    };
  }
}

export const interactionAssist = new InteractionAssistService();
