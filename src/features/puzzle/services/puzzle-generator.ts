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
    
    const pieceWidth = sourceImage.width / columns;
    const pieceHeight = sourceImage.height / rows;

    const pieces: PuzzlePiece[] = [];

    // 1. Generate pieces in their correct positions
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        pieces.push({
          id: `${row}-${col}`,
          sourceImageId: sourceImage.id,
          row,
          col,
          sourceRect: {
            x: col * pieceWidth,
            y: row * pieceHeight,
            width: pieceWidth,
            height: pieceHeight,
          },
          correctPosition: {
            x: col * pieceWidth,
            y: row * pieceHeight,
          },
          // Position will be randomized shortly
          position: { x: 0, y: 0 },
          width: pieceWidth,
          height: pieceHeight,
          isLocked: false,
        });
      }
    }

    // 2. Shuffle positions deterministically
    // We shuffle the correct positions and assign them to `position`
    const availablePositions = pieces.map(p => ({ ...p.correctPosition }));
    
    // Fisher-Yates shuffle using the injected random source
    for (let i = availablePositions.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
    }

    // 3. Assign randomized positions
    return pieces.map((piece, index) => ({
      ...piece,
      position: availablePositions[index],
    }));
  }
}
