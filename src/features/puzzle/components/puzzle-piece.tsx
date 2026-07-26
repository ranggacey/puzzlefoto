import React from "react";
import { motion } from "motion/react";
import type { PuzzlePiece as PuzzlePieceType } from "../types/puzzle-piece";
import type { CapturedPhoto } from "@/types";
import { DIFFICULTY_PRESETS, PuzzleDifficulty } from "../constants/puzzle-difficulty";
import type { DragState } from "../hooks/use-unified-drag";
import { InteractionConfig } from "@/features/hand-tracking/constants/interaction-config";

interface PuzzlePieceProps {
  piece: PuzzlePieceType;
  sourceImage: CapturedPhoto;
  difficulty: PuzzleDifficulty;
  dragState: DragState;
  isHovered: boolean;
  onPointerDown: (pieceId: string, clientX: number, clientY: number) => void;
}

export const PuzzlePiece = React.memo(function PuzzlePiece({ 
  piece, 
  sourceImage,
  difficulty,
  dragState,
  isHovered,
  onPointerDown,
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
    hover: {
      opacity: 0.9,
      scale: 1.02,
      zIndex: 20,
      filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.4))",
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
      filter: "drop-shadow(0 0 12px rgba(255,255,255,0.3)) drop-shadow(0 0 4px rgba(255,255,255,0.5))",
    },
  };

  const isDragging = dragState.draggedPieceId === piece.id;
  const currentState = piece.isLocked ? "locked" : isDragging ? "active" : isHovered ? "hover" : "idle";

  return (
    <motion.div
      layout
      variants={pieceVariants}
      initial={false}
      animate={{
        ...pieceVariants[currentState],
        x: isDragging ? dragState.dragDeltaX : 0,
        y: isDragging ? dragState.dragDeltaY + InteractionConfig.dragOffsetY : 0,
      }}
      transition={{
        x: { type: "spring", stiffness: 500, damping: 50 },
        y: { type: "spring", stiffness: 500, damping: 50 },
        layout: { type: "spring", stiffness: 300, damping: 30 }
      }}
      whileHover={!piece.isLocked && !isDragging ? "hover" : undefined}
      onPointerDown={(e) => {
        if (!piece.isLocked) {
          // Prevent default touch actions (e.g. scrolling on mobile)
          e.preventDefault();
          onPointerDown(piece.id, e.clientX, e.clientY);
        }
      }}
      className={`absolute overflow-hidden rounded-sm ${!piece.isLocked ? "border border-white/20 cursor-grab active:cursor-grabbing" : ""}`}
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
