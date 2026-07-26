import React from "react";
import type { PuzzlePiece as PuzzlePieceType } from "../types/puzzle-piece";
import type { CapturedPhoto } from "@/types";
import { PuzzleDifficulty, DIFFICULTY_PRESETS } from "../constants/puzzle-difficulty";
import { PuzzlePiece } from "./puzzle-piece";
import { usePuzzleStore } from "@/store/puzzle-store";
import type { PanInfo } from "motion/react";
import { motion } from "motion/react";

interface PuzzleBoardProps {
  pieces: PuzzlePieceType[];
  sourceImage: CapturedPhoto | null;
  difficulty: PuzzleDifficulty;
}

export function PuzzleBoard({ pieces, sourceImage, difficulty }: PuzzleBoardProps) {
  const boardRef = React.useRef<HTMLDivElement>(null);
  const movePieceToSlot = usePuzzleStore((state) => state.movePieceToSlot);
  const isComplete = usePuzzleStore((state) => state.isComplete);

  const handlePieceDragEnd = React.useCallback(
    (pieceId: string, info: PanInfo) => {
      if (!boardRef.current) return;

      const rect = boardRef.current.getBoundingClientRect();
      const x = info.point.x - rect.left;
      const y = info.point.y - rect.top;

      // Ensure drop is within board bounds
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        return;
      }

      const { columns, rows } = DIFFICULTY_PRESETS[difficulty];

      // Calculate which slot the center of the dragged pointer is over
      const col = Math.floor((x / rect.width) * columns);
      const row = Math.floor((y / rect.height) * rows);

      // Clamp to be safe
      const safeCol = Math.max(0, Math.min(col, columns - 1));
      const safeRow = Math.max(0, Math.min(row, rows - 1));
      
      const targetSlotIndex = safeRow * columns + safeCol;
      
      movePieceToSlot(pieceId, targetSlotIndex);
    },
    [difficulty, movePieceToSlot]
  );

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
            dragConstraints={boardRef}
            onPieceDragEnd={handlePieceDragEnd}
          />
        ))}
      </motion.div>
    </div>
  );
}
