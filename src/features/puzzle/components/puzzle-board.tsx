import React from "react";
import type { PuzzlePiece as PuzzlePieceType } from "../types/puzzle-piece";
import type { CapturedPhoto } from "@/types";
import { PuzzleDifficulty, DIFFICULTY_PRESETS } from "../constants/puzzle-difficulty";
import { PuzzlePiece } from "./puzzle-piece";
import { usePuzzleStore } from "@/store/puzzle-store";
import { motion } from "motion/react";
import { useUnifiedDrag } from "../hooks/use-unified-drag";
import { useHandTracking } from "@/features/hand-tracking/providers/hand-tracking-provider";
import { InteractionConfig } from "@/features/hand-tracking/constants/interaction-config";

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
    registerGestureCallbacks(
      feedSyntheticEvent,
      {
        hitTest: (x, y) => {
          if (!boardRef.current) return undefined;
          
          const rect = boardRef.current.getBoundingClientRect();
          const { columns, rows } = DIFFICULTY_PRESETS[difficulty];
          const slotWidth = rect.width / columns;
          const slotHeight = rect.height / rows;
          
          const px = x * rect.width;
          const py = y * rect.height;

          let closestPieceId: string | undefined = undefined;
          let minDistance = Infinity;

          for (const piece of pieces) {
            if (piece.isLocked) continue;

            const col = piece.currentSlotIndex % columns;
            const row = Math.floor(piece.currentSlotIndex / columns);
            
            const pieceCenterX = (col + 0.5) * slotWidth;
            const pieceCenterY = (row + 0.5) * slotHeight;

            // Distance to edge
            const dx = Math.max(0, Math.abs(px - pieceCenterX) - slotWidth / 2);
            const dy = Math.max(0, Math.abs(py - pieceCenterY) - slotHeight / 2);
            const distanceToEdge = Math.sqrt(dx * dx + dy * dy);

            if (distanceToEdge <= InteractionConfig.hoverRadius && distanceToEdge < minDistance) {
              minDistance = distanceToEdge;
              closestPieceId = piece.id;
            }
          }
          
          return closestPieceId;
        }
      }
    );
  }, [registerGestureCallbacks, feedSyntheticEvent, difficulty, pieces]);

  if (!sourceImage) return null;

  let previewSlotIndex: number | null = null;
  if (dragState.isDragging && dragState.boardRect) {
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
