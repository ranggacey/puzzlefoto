import React from "react";
import { motion } from "motion/react";
import type { PuzzlePiece as PuzzlePieceType } from "../types/puzzle-piece";
import type { CapturedPhoto } from "@/types";
import { DIFFICULTY_PRESETS, PuzzleDifficulty } from "../constants/puzzle-difficulty";

interface PuzzlePieceProps {
  piece: PuzzlePieceType;
  sourceImage: CapturedPhoto;
  difficulty: PuzzleDifficulty;
}

export const PuzzlePiece = React.memo(function PuzzlePiece({ 
  piece, 
  sourceImage,
  difficulty
}: PuzzlePieceProps) {
  const { rows, columns } = DIFFICULTY_PRESETS[difficulty];

  // We use percentages so the puzzle automatically scales with the board container.
  const widthPercent = 100 / columns;
  const heightPercent = 100 / rows;

  const leftPercent = (piece.position.x / sourceImage.width) * 100;
  const topPercent = (piece.position.y / sourceImage.height) * 100;

  // Background position for CSS sprites based on percentages.
  // CSS percentage background-position works such that 0% is start, 100% is end.
  const bgPosX = columns > 1 ? (piece.col / (columns - 1)) * 100 : 0;
  const bgPosY = rows > 1 ? (piece.row / (rows - 1)) * 100 : 0;
  
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

  const currentState = piece.isLocked ? "locked" : "idle"; // active will be used in dragging

  return (
    <motion.div
      layout
      variants={pieceVariants}
      initial={false}
      animate={currentState}
      className="absolute overflow-hidden border border-white/20 rounded-sm"
      style={{
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        backgroundImage: `url(${sourceImage.image})`,
        backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
});
