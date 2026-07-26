import React from "react";
import type { PuzzlePiece as PuzzlePieceType } from "../types/puzzle-piece";
import type { CapturedPhoto } from "@/types";
import { PuzzleDifficulty, DIFFICULTY_PRESETS } from "../constants/puzzle-difficulty";
import { PuzzlePiece } from "./puzzle-piece";
import { usePuzzleStore } from "@/store/puzzle-store";
import { motion } from "motion/react";
import { useUnifiedDrag } from "../hooks/use-unified-drag";
import { useHandTracking } from "@/features/hand-tracking/providers/hand-tracking-provider";

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
          const { columns, rows } = DIFFICULTY_PRESETS[difficulty];
          const col = Math.floor(x * columns);
          const row = Math.floor(y * rows);
          const safeCol = Math.max(0, Math.min(col, columns - 1));
          const safeRow = Math.max(0, Math.min(row, rows - 1));
          const targetSlotIndex = safeRow * columns + safeCol;
          
          const piece = pieces.find(p => p.currentSlotIndex === targetSlotIndex);
          return piece?.isLocked ? undefined : piece?.id;
        }
      }
    );
  }, [registerGestureCallbacks, feedSyntheticEvent, difficulty, pieces]);

  if (!sourceImage) return null;

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
