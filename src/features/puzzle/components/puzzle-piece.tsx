import React from "react";
import { motion } from "motion/react";
import type { PuzzlePiece as PuzzlePieceType } from "../types/puzzle-piece";
import type { CapturedPhoto } from "@/types";
import { DIFFICULTY_PRESETS, PuzzleDifficulty } from "../constants/puzzle-difficulty";
import type { PanInfo } from "motion/react";

interface PuzzlePieceProps {
  piece: PuzzlePieceType;
  sourceImage: CapturedPhoto;
  difficulty: PuzzleDifficulty;
  dragConstraints?: React.RefObject<Element | null>;
  onPieceDragEnd?: (pieceId: string, info: PanInfo) => void;
}

export const PuzzlePiece = React.memo(function PuzzlePiece({ 
  piece, 
  sourceImage,
  difficulty,
  dragConstraints,
  onPieceDragEnd,
}: PuzzlePieceProps) {
  const { rows, columns } = DIFFICULTY_PRESETS[difficulty];

  const widthPercent = 100 / columns;
  const heightPercent = 100 / rows;

  // Calculate current slot position
  const currentCol = piece.currentSlotIndex % columns;
  const currentRow = Math.floor(piece.currentSlotIndex / columns);

  const leftPercent = currentCol * widthPercent;
  const topPercent = currentRow * heightPercent;

  // Background position from original source crop
  const bgPosX = columns > 1 ? (piece.sourceCol / (columns - 1)) * 100 : 0;
  const bgPosY = rows > 1 ? (piece.sourceRow / (rows - 1)) * 100 : 0;
  
  const bgSizeX = columns * 100;
  const bgSizeY = rows * 100;

  const pieceVariants = {
    idle: {
      opacity: 0.8,
      scale: 1,
      zIndex: 10,
      filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
    },
    active: {
      opacity: 1,
      scale: 1.05,
      zIndex: 50,
      filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.5))",
    },
    locked: {
      opacity: 1,
      scale: 1,
      zIndex: 1,
      filter: "drop-shadow(0 0 8px rgba(255,255,255,0.4))",
    },
  };

  const [isDragging, setIsDragging] = React.useState(false);
  const currentState = piece.isLocked ? "locked" : isDragging ? "active" : "idle";

  return (
    <motion.div
      layout
      variants={pieceVariants}
      initial={false}
      animate={currentState}
      drag={!piece.isLocked}
      dragConstraints={dragConstraints}
      dragElastic={0}
      dragMomentum={false}
      dragSnapToOrigin={true}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info) => {
        setIsDragging(false);
        if (onPieceDragEnd) {
          onPieceDragEnd(piece.id, info);
        }
      }}
      className={`absolute overflow-hidden border border-white/20 rounded-sm ${!piece.isLocked ? "cursor-grab active:cursor-grabbing" : ""}`}
      style={{
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        backgroundImage: `url(${sourceImage.image})`,
        backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
        backgroundRepeat: "no-repeat",
        touchAction: "none", // Prevent scrolling while dragging on mobile
      }}
    />
  );
});
