import { create } from "zustand";
import type { LoadingState, CapturedPhoto } from "@/types";
import { PuzzlePiece } from "@/features/puzzle/types/puzzle-piece";
import { PuzzleDifficulty } from "@/features/puzzle/constants/puzzle-difficulty";
import { PuzzleGenerator } from "@/features/puzzle/services/puzzle-generator";
import { InteractionLogger } from "@/lib/debug/interaction-logger";

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
  handlePieceSelection: (pieceId: string) => void;
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
  setDifficulty: (difficulty) => set({ difficulty, selectedPieceId: null }),
  setScene: (scene) => set({ scene, selectedPieceId: null }),
  setSourceImage: (photo) => set({ sourceImage: photo, selectedPieceId: null }),
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
        selectedPieceId: null,
      });
    } catch (err) {
      console.error("Failed to generate puzzle:", err);
      set({ generationState: "error" });
    }
  },

  movePieceToSlot: (pieceId: string, targetSlotIndex: number) => {
    const state = get();
    const sourcePiece = state.pieces.find(p => p.id === pieceId);
    
    InteractionLogger.logState("PuzzleStore", {
      action: "movePieceToSlot",
      pieceId,
      currentSlot: sourcePiece?.currentSlotIndex,
      targetSlot: targetSlotIndex,
      targetPiece: state.pieces.find(p => p.currentSlotIndex === targetSlotIndex)?.id || "None",
      moveCount: state.moveCount
    });

    if (!sourcePiece) {
      InteractionLogger.logDecision("PuzzleStore", "Move Rejected", ["✖ Reason: Source piece not found"]);
      return;
    }
    if (sourcePiece.isLocked) {
      InteractionLogger.logDecision("PuzzleStore", "Move Rejected", ["✖ Reason: Source piece is locked"]);
      return;
    }

    const sourceSlotIndex = sourcePiece.currentSlotIndex;
    if (sourceSlotIndex === targetSlotIndex) {
      InteractionLogger.logDecision("PuzzleStore", "Move Rejected", ["✖ Reason: Source and target slots are identical"]);
      return;
    }

    const targetPiece = state.pieces.find(p => p.currentSlotIndex === targetSlotIndex);
    if (targetPiece?.isLocked) {
      InteractionLogger.logDecision("PuzzleStore", "Move Rejected", ["✖ Reason: Target piece is locked"]);
      return;
    }

    InteractionLogger.logDecision("PuzzleStore", "Move Accepted", [
      `✔ Source Piece: ${pieceId} (Slot ${sourceSlotIndex})`,
      `✔ Target Slot: ${targetSlotIndex}`,
      `✔ Swap Partner: ${targetPiece ? targetPiece.id : "None"}`,
      `✔ Resulting Move Count: ${state.moveCount + 1}`
    ]);

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
    InteractionLogger.logDecision("PuzzleStore", "Swap Success", ["✔ pieces array updated"]);

    // Internal check win
    const allLocked = newPieces.every(p => p.isLocked);
    if (allLocked && newPieces.length > 0) {
      get().completePuzzle();
    }
  },

  handlePieceSelection: (pieceId: string) => {
    const state = get();
    const targetPiece = state.pieces.find(p => p.id === pieceId);
    
    InteractionLogger.logState("PuzzleStore.handlePieceSelection", {
      selected: state.selectedPieceId,
      clicked: pieceId,
      locked: targetPiece?.isLocked,
      samePiece: state.selectedPieceId === pieceId
    });

    if (!targetPiece) {
      InteractionLogger.logDecision("PuzzleStore", "Decision: REJECT", ["✖ Reason: clicked piece not found"]);
      return;
    }
    if (targetPiece.isLocked) {
      InteractionLogger.logDecision("PuzzleStore", "Decision: REJECT", ["✖ Reason: clicked piece locked"]);
      return;
    }
    
    if (state.selectedPieceId === null) {
      // Select
      InteractionLogger.logDecision("PuzzleStore", "Decision: SELECT", ["✔ Valid initial selection"]);
      InteractionLogger.logState("PuzzleStore", {
        OldSelected: "None",
        NewSelected: pieceId,
        Action: "Piece Selected"
      });
      InteractionLogger.logTransition("PuzzleStore", "Idle", "Selected");
      set({ selectedPieceId: pieceId });
    } else if (state.selectedPieceId === pieceId) {
      // Cancel self-selection
      InteractionLogger.logDecision("PuzzleStore", "Decision: CANCEL", ["✖ Reason: same selected piece"]);
      InteractionLogger.logDecision("PuzzleStore", "Selection Cleared", ["✔ Selected piece equals hovered piece"]);
      InteractionLogger.logTransition("PuzzleStore", "Selected", "Selection Cleared");
      InteractionLogger.logTransition("PuzzleStore", "Selection Cleared", "Idle");
      set({ selectedPieceId: null });
    } else {
      // Swap!
      InteractionLogger.logDecision("PuzzleStore", "Decision: SWAP", ["✔ Valid swap target identified"]);
      InteractionLogger.logDecision("PuzzleStore", "Swap Requested", [
        `✔ Selected Piece: ${state.selectedPieceId}`,
        `✔ Target Piece: ${pieceId}`
      ]);
      InteractionLogger.logTransition("PuzzleStore", "Selected", "Swap Requested");
      get().movePieceToSlot(state.selectedPieceId, targetPiece.currentSlotIndex);
      InteractionLogger.logTransition("PuzzleStore", "Swap Requested", "Swap Executed");
      InteractionLogger.logTransition("PuzzleStore", "Swap Executed", "Selection Cleared");
      InteractionLogger.logTransition("PuzzleStore", "Selection Cleared", "Idle");
      set({ selectedPieceId: null });
    }
  },

  completePuzzle: () => {
    set({ 
      isComplete: true, 
      completedAt: Date.now(),
      isTimerRunning: false,
      selectedPieceId: null,
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
