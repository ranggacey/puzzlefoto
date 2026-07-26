import React from "react";
import type { PuzzlePiece as PuzzlePieceType } from "../types/puzzle-piece";
import type { CapturedPhoto } from "@/types";
import { PuzzleDifficulty } from "../constants/puzzle-difficulty";
import { PuzzlePiece } from "./puzzle-piece";

interface PuzzleBoardProps {
  pieces: PuzzlePieceType[];
  sourceImage: CapturedPhoto | null;
  difficulty: PuzzleDifficulty;
}

export function PuzzleBoard({ pieces, sourceImage, difficulty }: PuzzleBoardProps) {
  if (!sourceImage) return null;

  return (
    <div className="relative w-full max-w-4xl aspect-[4/3] mx-auto flex items-center justify-center p-4 sm:p-8">
      {/* Pieces Container - Landscape aspect ratio */}
      <div className="relative w-full h-full">
        {pieces.map((piece) => (
          <PuzzlePiece 
            key={piece.id} 
            piece={piece} 
            sourceImage={sourceImage}
            difficulty={difficulty}
          />
        ))}
      </div>
    </div>
  );
}
