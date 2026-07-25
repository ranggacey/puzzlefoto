// ============================================================
// Puzzle-related type definitions (for future implementation)
// ============================================================

import type { PuzzlePiece } from "./index";

export interface PuzzleConfig {
  rows: number;
  cols: number;
  imageUrl: string;
}

export interface PuzzleState {
  pieces: PuzzlePiece[];
  selectedPieceId: number | null;
  isComplete: boolean;
  moveCount: number;
  elapsedTime: number;
}

export type PuzzleDifficulty = "easy" | "medium" | "hard";

export const puzzleDifficultyConfig: Record<
  PuzzleDifficulty,
  { rows: number; cols: number; label: string }
> = {
  easy: { rows: 3, cols: 3, label: "3 x 3" },
  medium: { rows: 4, cols: 4, label: "4 x 4" },
  hard: { rows: 5, cols: 5, label: "5 x 5" },
};
