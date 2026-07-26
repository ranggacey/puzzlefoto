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

  return (
    <motion.div
      layout
      initial={false}
      className="absolute overflow-hidden"
      style={{
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        backgroundImage: `url(${sourceImage.image})`,
        backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
        backgroundRepeat: "no-repeat",
        zIndex: piece.isLocked ? 1 : 10,
        filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
      }}
    />
  );
});
