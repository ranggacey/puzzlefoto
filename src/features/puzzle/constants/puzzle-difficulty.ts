export type PuzzleDifficulty = "easy" | "medium" | "hard";

export interface PuzzleDifficultyConfig {
  rows: number;
  columns: number;
  label: string;
}

export const DIFFICULTY_PRESETS: Record<PuzzleDifficulty, PuzzleDifficultyConfig> = {
  easy: { rows: 3, columns: 3, label: "3 x 3" },
  medium: { rows: 4, columns: 4, label: "4 x 4" },
  hard: { rows: 5, columns: 5, label: "5 x 5" },
};
