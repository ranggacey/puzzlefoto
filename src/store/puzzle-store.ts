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
  | "gameplay"
  | "completed";

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
  /** Timestamp when puzzle started */
  startedAt: number | null;
  /** Timestamp when puzzle was completed */
  completedAt: number | null;

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
  movePieceToSlot: (pieceId: string, targetSlotIndex: number) => void;
  restartPuzzle: () => void;
  completePuzzle: () => void;
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
  startedAt: null,
  completedAt: null,
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
      set({ 
        pieces, 
        generationState: "success",
        startedAt: Date.now(),
        completedAt: null,
        moveCount: 0,
        isComplete: false,
        scene: "gameplay",
        isTimerRunning: true,
        elapsedTime: 0,
      });
    } catch (err) {
      console.error("Failed to generate puzzle:", err);
      set({ generationState: "error" });
    }
  },

  movePieceToSlot: (pieceId: string, targetSlotIndex: number) => {
    const state = get();
    const sourcePiece = state.pieces.find(p => p.id === pieceId);
    if (!sourcePiece || sourcePiece.isLocked) return;

    const sourceSlotIndex = sourcePiece.currentSlotIndex;
    if (sourceSlotIndex === targetSlotIndex) return;

    const targetPiece = state.pieces.find(p => p.currentSlotIndex === targetSlotIndex);
    if (targetPiece?.isLocked) return;

    const newPieces = state.pieces.map(piece => {
      const updatedPiece = { ...piece };
      
      if (piece.id === pieceId) {
        updatedPiece.currentSlotIndex = targetSlotIndex;
      } else if (piece.currentSlotIndex === targetSlotIndex) {
        updatedPiece.currentSlotIndex = sourceSlotIndex;
      }

      // Check lock state
      if (updatedPiece.currentSlotIndex === updatedPiece.correctSlotIndex) {
        updatedPiece.isLocked = true;
      }
      
      return updatedPiece;
    });

    set({ pieces: newPieces, moveCount: state.moveCount + 1 });

    // Internal check win
    const allLocked = newPieces.every(p => p.isLocked);
    if (allLocked && newPieces.length > 0) {
      get().completePuzzle();
    }
  },

  completePuzzle: () => {
    set({ 
      isComplete: true, 
      completedAt: Date.now(),
      isTimerRunning: false 
    });
    
    // Victory presentation delay
    setTimeout(() => {
      set({ scene: "completed" });
    }, 500);
  },

  restartPuzzle: () => {
    const { sourceImage } = get();
    if (sourceImage) {
      get().generatePuzzle(sourceImage);
    }
  },

  reset: () => set(initialPuzzleState),
}));
