import React from "react";
import { motion } from "motion/react";
import type { PuzzlePiece as PuzzlePieceType } from "../types/puzzle-piece";
import type { CapturedPhoto } from "@/types";
import { DIFFICULTY_PRESETS, PuzzleDifficulty } from "../constants/puzzle-difficulty";
import type { DragState } from "../hooks/use-unified-drag";
import { InteractionConfig } from "@/features/hand-tracking/constants/interaction-config";
import { interactionAssist } from "@/features/hand-tracking/services/interaction-assist";
import { motionPresets } from "@/lib/motion";

interface PuzzlePieceProps {
  piece: PuzzlePieceType;
  sourceImage: CapturedPhoto;
  difficulty: PuzzleDifficulty;
  dragState: DragState;
  isHovered: boolean;
  isSelected: boolean;
  isSwapTarget: boolean;
  hoverProgress: number;
  onPointerDown: (pieceId: string, clientX: number, clientY: number) => void;
}

export const PuzzlePiece = React.memo(function PuzzlePiece({ 
  piece, 
  sourceImage,
  difficulty,
  dragState,
  isHovered,
  isSelected,
  isSwapTarget,
  hoverProgress,
  onPointerDown,
}: PuzzlePieceProps) {
  const setPieceRef = React.useCallback((node: HTMLDivElement | null) => {
    if (node && !piece.isLocked) {
      interactionAssist.registerTarget(piece.id, node);
    } else {
      interactionAssist.unregisterTarget(piece.id);
    }
  }, [piece.isLocked, piece.id]);

  const { rows, columns } = DIFFICULTY_PRESETS[difficulty];

  const widthPercent = 100 / columns;
  const heightPercent = 100 / rows;

  // Calculate current slot position
  const currentCol = piece.currentSlotIndex % columns;
  const currentRow = Math.floor(piece.currentSlotIndex / columns);

  const leftPercent = currentCol * widthPercent;
  const topPercent = currentRow * heightPercent;

  const bgPosX = columns > 1 ? (piece.sourceCol / (columns - 1)) * 100 : 0;
  const bgPosY = rows > 1 ? (piece.sourceRow / (rows - 1)) * 100 : 0;
  
  const bgSizeX = columns * 100;
  const bgSizeY = rows * 100;

  const isDragging = dragState.draggedPieceId === piece.id;
  const currentState = piece.isLocked 
    ? "locked" 
    : isDragging 
      ? "active" 
      : isSelected 
        ? "selected" 
        : isSwapTarget 
          ? "swapTarget" 
          : isHovered 
            ? "hover" 
            : "idle";

  return (
    <motion.div
      ref={setPieceRef}
      layout
      variants={motionPresets.puzzle}
      initial={false}
      animate={currentState}
      style={{
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        backgroundImage: `url(${sourceImage.image})`,
        backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
        backgroundRepeat: "no-repeat",
        touchAction: "none",
        x: isDragging ? dragState.dragDeltaX : 0,
        y: isDragging ? dragState.dragDeltaY + InteractionConfig.dragOffsetY : 0,
      }}
      transition={{
        x: { type: "spring", stiffness: isDragging ? 100 : 500, damping: isDragging ? 20 : 50 },
        y: { type: "spring", stiffness: isDragging ? 100 : 500, damping: isDragging ? 20 : 50 },
        layout: { type: "spring", stiffness: 300, damping: 30 }
      }}
      whileHover={!piece.isLocked && !isDragging ? "hover" : undefined}
      data-piece-id={piece.id}
      onPointerDown={(e) => {
        if (!piece.isLocked) {
          e.preventDefault();
          onPointerDown(piece.id, e.clientX, e.clientY);
        }
      }}
      className={`absolute overflow-hidden rounded-sm ${!piece.isLocked ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      {/* Interaction Anchor (Only for hand tracking / unlocked pieces) */}
      {!piece.isLocked && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          {/* Progress Ring */}
          {!isSelected && !isSwapTarget && hoverProgress > 0 && (
            <svg className="absolute w-8 h-8 -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="rgba(255, 255, 255, 0.9)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="88"
                strokeDashoffset={88 - (88 * hoverProgress)}
                strokeLinecap="round"
              />
            </svg>
          )}

          {/* Core Indicator */}
          <motion.div
            initial={false}
            animate={{
              width: isSelected ? 16 : isHovered || isSwapTarget ? 12 : 8,
              height: isSelected ? 16 : isHovered || isSwapTarget ? 12 : 8,
              backgroundColor: isSelected 
                ? "rgba(34, 197, 94, 1)" 
                : isSwapTarget 
                  ? "rgba(59, 130, 246, 1)" 
                  : "rgba(255, 255, 255, 0.9)",
              boxShadow: isSelected 
                ? "0 0 12px rgba(34, 197, 94, 0.8)" 
                : isSwapTarget
                  ? "0 0 12px rgba(59, 130, 246, 0.8)"
                  : isHovered 
                    ? "0 0 8px rgba(255, 255, 255, 0.8)" 
                    : "0 0 4px rgba(0, 0, 0, 0.5)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        </div>
      )}
    </motion.div>
  );
});
