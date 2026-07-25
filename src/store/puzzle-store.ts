import { create } from "zustand";
import type { LoadingState, PuzzlePiece } from "@/types";
import type { PuzzleDifficulty } from "@/types/puzzle";

// ============================================================
// Puzzle Store (shell for future implementation)
// ============================================================

interface PuzzleState {
  /** Puzzle pieces array */
  pieces: PuzzlePiece[];
  /** Currently selected/held piece */
  selectedPieceId: number | null;
  /** Puzzle grid dimensions */
  difficulty: PuzzleDifficulty;
  /** Source image for the puzzle */
  imageUrl: string | null;
  /** Whether the puzzle is complete */
  isComplete: boolean;
  /** Number of moves made */
  moveCount: number;
  /** Elapsed time in seconds */
  elapsedTime: number;
  /** Whether the timer is running */
  isTimerRunning: boolean;
  /** Puzzle generation state */
  generationState: LoadingState;

  // Actions
  setPieces: (pieces: PuzzlePiece[]) => void;
  setSelectedPiece: (id: number | null) => void;
  setDifficulty: (difficulty: PuzzleDifficulty) => void;
  setImageUrl: (url: string) => void;
  setComplete: (complete: boolean) => void;
  incrementMoves: () => void;
  setElapsedTime: (time: number) => void;
  setTimerRunning: (running: boolean) => void;
  setGenerationState: (state: LoadingState) => void;
  reset: () => void;
}

const initialPuzzleState = {
  pieces: [],
  selectedPieceId: null,
  difficulty: "medium" as const,
  imageUrl: null,
  isComplete: false,
  moveCount: 0,
  elapsedTime: 0,
  isTimerRunning: false,
  generationState: "idle" as const,
};

export const usePuzzleStore = create<PuzzleState>((set) => ({
  ...initialPuzzleState,

  setPieces: (pieces) => set({ pieces }),
  setSelectedPiece: (id) => set({ selectedPieceId: id }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setImageUrl: (url) => set({ imageUrl: url }),
  setComplete: (complete) => set({ isComplete: complete }),
  incrementMoves: () => set((state) => ({ moveCount: state.moveCount + 1 })),
  setElapsedTime: (time) => set({ elapsedTime: time }),
  setTimerRunning: (running) => set({ isTimerRunning: running }),
  setGenerationState: (state) => set({ generationState: state }),
  reset: () => set(initialPuzzleState),
}));
