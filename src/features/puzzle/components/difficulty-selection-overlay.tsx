import { motion } from "motion/react";
import { PuzzleDifficulty, DIFFICULTY_PRESETS } from "../constants/puzzle-difficulty";
import { useState } from "react";
import { RotateCcw, Play } from "lucide-react";
import { InteractionSurface } from "@/features/hand-tracking/components/interaction-surface";

interface DifficultySelectionOverlayProps {
  onContinue: (difficulty: PuzzleDifficulty) => void;
  onRetake: () => void;
}

export function DifficultySelectionOverlay({
  onContinue,
  onRetake,
}: DifficultySelectionOverlayProps) {
  const [selected, setSelected] = useState<PuzzleDifficulty>("easy");

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl bg-black/80 border border-white/10 p-6 shadow-2xl backdrop-blur-md"
      >
        <h2 className="mb-6 text-center text-2xl font-semibold text-white tracking-tight">
          Select Difficulty
        </h2>

        <div className="space-y-3 mb-8">
          {(Object.keys(DIFFICULTY_PRESETS) as PuzzleDifficulty[]).map((diff) => (
            <InteractionSurface 
              key={diff} 
              onClick={() => setSelected(diff)} 
              magnetic 
              className="w-full rounded-xl"
            >
              <button
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all ${
                  selected === diff
                    ? "bg-white text-black font-medium"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="capitalize">{diff}</span>
                <span className="text-sm opacity-60">
                  {DIFFICULTY_PRESETS[diff].label}
                </span>
              </button>
            </InteractionSurface>
          ))}
        </div>

        <div className="flex gap-3">
          <InteractionSurface onClick={onRetake} magnetic className="flex-1 rounded-xl">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-medium text-white transition-colors hover:bg-white/20 active:scale-95">
              <RotateCcw className="h-5 w-5" />
              Retake
            </button>
          </InteractionSurface>
          
          <InteractionSurface onClick={() => onContinue(selected)} magnetic className="flex-1 rounded-xl">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95">
              <Play className="h-5 w-5 fill-current" />
              Start
            </button>
          </InteractionSurface>
        </div>
      </motion.div>
    </div>
  );
}
