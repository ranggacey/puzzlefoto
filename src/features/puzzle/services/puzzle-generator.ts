import { CapturedPhoto } from "@/types";
import { PuzzlePiece } from "../types/puzzle-piece";
import { DIFFICULTY_PRESETS, PuzzleDifficulty } from "../constants/puzzle-difficulty";

interface GeneratorOptions {
  difficulty?: PuzzleDifficulty;
  random?: () => number;
}

export class PuzzleGenerator {
  /**
   * Generates a randomized puzzle piece array from a captured photo.
   * Pure function: does not mutate state or access external systems.
   */
  static generate(
    sourceImage: CapturedPhoto,
    options: GeneratorOptions = {}
  ): PuzzlePiece[] {
    const { 
      difficulty = "easy", 
      random = Math.random 
    } = options;

    const config = DIFFICULTY_PRESETS[difficulty];
    const { rows, columns } = config;

    const pieces: PuzzlePiece[] = [];

    // 1. Generate pieces in their correct slots
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        pieces.push({
          id: `${row}-${col}`,
          sourceImageId: sourceImage.id,
          correctSlotIndex: index,
          currentSlotIndex: index,
          sourceRow: row,
          sourceCol: col,
          isLocked: false,
        });
      }
    }

    // 2. Shuffle slots deterministically
    const availableSlots = pieces.map(p => p.correctSlotIndex);
    
    // Fisher-Yates shuffle using the injected random source
    for (let i = availableSlots.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [availableSlots[i], availableSlots[j]] = [availableSlots[j], availableSlots[i]];
    }

    // 3. Assign randomized slots and lock if accidentally correct
    return pieces.map((piece, i) => {
      const currentSlotIndex = availableSlots[i];
      return {
        ...piece,
        currentSlotIndex,
        isLocked: currentSlotIndex === piece.correctSlotIndex,
      };
    });
  }
}
