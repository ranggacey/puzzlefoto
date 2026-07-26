import React from "react";
import type { PuzzlePiece as PuzzlePieceType } from "../types/puzzle-piece";
import type { CapturedPhoto } from "@/types";
import { PuzzleDifficulty, DIFFICULTY_PRESETS } from "../constants/puzzle-difficulty";
import { PuzzlePiece } from "./puzzle-piece";
import { usePuzzleStore } from "@/store/puzzle-store";
import { motion } from "motion/react";
import { useUnifiedDrag } from "../hooks/use-unified-drag";
import { useHandTracking } from "@/features/hand-tracking/providers/hand-tracking-provider";
import { interactionAssist } from "@/features/hand-tracking/services/interaction-assist";

interface PuzzleBoardProps {
  pieces: PuzzlePieceType[];
  sourceImage: CapturedPhoto | null;
  difficulty: PuzzleDifficulty;
}

export function PuzzleBoard({ pieces, sourceImage, difficulty }: PuzzleBoardProps) {
  const boardRef = React.useRef<HTMLDivElement>(null);
  const movePieceToSlot = usePuzzleStore((state) => state.movePieceToSlot);
  const isComplete = usePuzzleStore((state) => state.isComplete);
  const { registerGestureCallbacks, gestureState } = useHandTracking();

  const handleDrop = React.useCallback(
    (pieceId: string, clientX: number, clientY: number) => {
      if (!boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      // Check adaptive drop target first
      const adaptiveTarget = interactionAssist.getAdaptiveDropTarget(clientX, clientY);
      if (adaptiveTarget !== null) {
        movePieceToSlot(pieceId, adaptiveTarget);
        return;
      }

      // Fallback
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        return;
      }

      const { columns, rows } = DIFFICULTY_PRESETS[difficulty];
      const col = Math.floor((x / rect.width) * columns);
      const row = Math.floor((y / rect.height) * rows);

      const safeCol = Math.max(0, Math.min(col, columns - 1));
      const safeRow = Math.max(0, Math.min(row, rows - 1));
      
      const targetSlotIndex = safeRow * columns + safeCol;
      movePieceToSlot(pieceId, targetSlotIndex);
    },
    [difficulty, movePieceToSlot]
  );

  const { dragState, handlePointerDown, feedSyntheticEvent } = useUnifiedDrag({
    boardRef,
    onDrop: handleDrop,
  });

  // Register with Hand Tracking
  React.useEffect(() => {
    interactionAssist.updateContext(() => boardRef.current?.getBoundingClientRect() ?? null, pieces, difficulty);
    
    registerGestureCallbacks(
      (event) => feedSyntheticEvent(interactionAssist.processEvent(event)),
      {
        hitTest: (x, y) => interactionAssist.hitTest(x, y)
      }
    );
  }, [registerGestureCallbacks, feedSyntheticEvent, difficulty, pieces]);

  if (!sourceImage) return null;

  let previewSlotIndex: number | null = null;
  if (dragState.isDragging && dragState.boardRect) {
    const adaptiveTarget = interactionAssist.getAdaptiveDropTarget(dragState.currentX, dragState.currentY);
    if (adaptiveTarget !== null) {
      previewSlotIndex = adaptiveTarget;
    } else {
      const rect = dragState.boardRect;
      const x = dragState.currentX - rect.left;
      const y = dragState.currentY - rect.top;
  
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        const { columns, rows } = DIFFICULTY_PRESETS[difficulty];
        const col = Math.floor((x / rect.width) * columns);
        const row = Math.floor((y / rect.height) * rows);
        const safeCol = Math.max(0, Math.min(col, columns - 1));
        const safeRow = Math.max(0, Math.min(row, rows - 1));
        previewSlotIndex = safeRow * columns + safeCol;
      }
    }
  }

  const { columns, rows } = DIFFICULTY_PRESETS[difficulty];
  const slotWidthPct = 100 / columns;
  const slotHeightPct = 100 / rows;

  return (
    <div className="relative w-full max-w-4xl aspect-[4/3] mx-auto flex items-center justify-center p-4 sm:p-8">
      {/* Pieces Container - Landscape aspect ratio */}
      <motion.div 
        ref={boardRef} 
        className="relative w-full h-full"
        animate={{
          scale: isComplete ? 1.02 : 1,
          filter: isComplete ? "drop-shadow(0 20px 30px rgba(255,255,255,0.2)) drop-shadow(0 0 40px rgba(255,255,255,0.1))" : "none",
        }}
        transition={{
          duration: 0.8,
          ease: "easeOut"
        }}
      >
        {previewSlotIndex !== null && !isComplete && (
          <motion.div
            className="absolute border-2 border-white/50 bg-white/10 rounded pointer-events-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              left: `${(previewSlotIndex % columns) * slotWidthPct}%`,
              top: `${Math.floor(previewSlotIndex / columns) * slotHeightPct}%`,
              width: `${slotWidthPct}%`,
              height: `${slotHeightPct}%`,
            }}
            transition={{ duration: 0.15 }}
            style={{ zIndex: 0 }}
          />
        )}
        
        {pieces.map((piece) => (
          <PuzzlePiece 
            key={piece.id} 
            piece={piece} 
            sourceImage={sourceImage}
            difficulty={difficulty}
            dragState={dragState}
            isHovered={gestureState.hoveredPieceId === piece.id}
            onPointerDown={handlePointerDown}
          />
        ))}
      </motion.div>
    </div>
  );
}
