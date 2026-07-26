import { create } from "zustand";
import type { LoadingState, CapturedPhoto } from "@/types";
import { PuzzlePiece } from "@/features/puzzle/types/puzzle-piece";
import { PuzzleDifficulty } from "@/features/puzzle/constants/puzzle-difficulty";
import { PuzzleGenerator } from "@/features/puzzle/services/puzzle-generator";

export type PuzzleScene =
  | "camera"
  | "capturing"
  | "freeze"
  | "floating"
  | "calibration"
  | "difficulty-selection"
  | "gameplay";

// ============================================================
// Puzzle Store
// ============================================================

interface PuzzleState {
  /** Puzzle pieces array */
  pieces: PuzzlePiece[];
  /** Currently selected/held piece */
  selectedPieceId: string | null;
  /** Puzzle grid dimensions */
  difficulty: PuzzleDifficulty;
  /** Puzzle scene state */
  scene: PuzzleScene;
  /** Source image for the puzzle */
  sourceImage: CapturedPhoto | null;
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
  setSelectedPiece: (id: string | null) => void;
  setDifficulty: (difficulty: PuzzleDifficulty) => void;
  setScene: (scene: PuzzleScene) => void;
  setSourceImage: (photo: CapturedPhoto | null) => void;
  setComplete: (complete: boolean) => void;
  incrementMoves: () => void;
  setElapsedTime: (time: number) => void;
  setTimerRunning: (running: boolean) => void;
  setGenerationState: (state: LoadingState) => void;
  generatePuzzle: (sourceImage: CapturedPhoto) => void;
  reset: () => void;
}

const initialPuzzleState = {
  pieces: [],
  selectedPieceId: null,
  difficulty: "easy" as const,
  scene: "camera" as const,
  sourceImage: null,
  isComplete: false,
  moveCount: 0,
  elapsedTime: 0,
  isTimerRunning: false,
  generationState: "idle" as const,
};

export const usePuzzleStore = create<PuzzleState>((set, get) => ({
  ...initialPuzzleState,

  setPieces: (pieces) => set({ pieces }),
  setSelectedPiece: (id) => set({ selectedPieceId: id }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setScene: (scene) => set({ scene }),
  setSourceImage: (photo) => set({ sourceImage: photo }),
  setComplete: (complete) => set({ isComplete: complete }),
  incrementMoves: () => set((state) => ({ moveCount: state.moveCount + 1 })),
  setElapsedTime: (time) => set({ elapsedTime: time }),
  setTimerRunning: (running) => set({ isTimerRunning: running }),
  setGenerationState: (state) => set({ generationState: state }),
  
  generatePuzzle: (sourceImage: CapturedPhoto) => {
    const { difficulty } = get();
    set({ generationState: "loading" });
    try {
      const pieces = PuzzleGenerator.generate(sourceImage, { difficulty });
      set({ pieces, generationState: "success" });
    } catch (err) {
      console.error("Failed to generate puzzle:", err);
      set({ generationState: "error" });
    }
  },

  reset: () => set(initialPuzzleState),
}));
