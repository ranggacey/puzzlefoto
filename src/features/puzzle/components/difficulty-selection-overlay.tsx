import { motion } from "motion/react";
import { motionPresets, stagger } from "@/lib/motion";
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
        variants={motionPresets.overlay}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-sm rounded-3xl bg-black/80 border border-white/10 p-6 shadow-2xl backdrop-blur-md"
      >
        <h2 className="mb-6 text-center text-2xl font-semibold text-white tracking-tight">
          Select Difficulty
        </h2>

        <motion.div 
          variants={stagger.medium}
          initial="hidden"
          animate="visible"
          className="space-y-3 mb-8"
        >
          {(Object.keys(DIFFICULTY_PRESETS) as PuzzleDifficulty[]).map((diff) => (
            <motion.div key={diff} variants={stagger.item}>
              <InteractionSurface 
                onClick={() => setSelected(diff)} 
                magnetic 
                className="w-full rounded-xl"
              >
                <motion.button
                  variants={motionPresets.button}
                  initial="idle"
                  whileHover="hover"
                  whileTap="press"
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 transition-colors ${
                    selected === diff
                      ? "bg-white text-black font-medium"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="capitalize">{diff}</span>
                  <span className="text-sm opacity-60">
                    {DIFFICULTY_PRESETS[diff].label}
                  </span>
                </motion.button>
              </InteractionSurface>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex gap-3">
          <InteractionSurface onClick={onRetake} magnetic className="flex-1 rounded-xl">
            <motion.button 
              variants={motionPresets.button}
              initial="idle"
              whileHover="hover"
              whileTap="press"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-medium text-white transition-colors hover:bg-white/20"
            >
              <RotateCcw className="h-5 w-5" />
              Retake
            </motion.button>
          </InteractionSurface>
          
          <InteractionSurface onClick={() => onContinue(selected)} magnetic className="flex-1 rounded-xl">
            <motion.button 
              variants={motionPresets.button}
              initial="idle"
              whileHover="hover"
              whileTap="press"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Play className="h-5 w-5 fill-current" />
              Start
            </motion.button>
          </InteractionSurface>
        </div>
      </motion.div>
    </div>
  );
}
