import React from "react";
import { motion } from "motion/react";
import { motionPresets, stagger } from "@/lib/motion";
import { usePuzzleStore } from "@/store/puzzle-store";
import { useRouter } from "next/navigation";
import { InteractionSurface } from "@/features/hand-tracking/components/interaction-surface";

export function PuzzleCompletedOverlay() {
  const { moveCount, difficulty, elapsedTime, restartPuzzle, reset } = usePuzzleStore();
  const router = useRouter();

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const formattedTime = formatTime(elapsedTime);

  const handleNewPhoto = () => {
    reset();
  };

  const handleHome = () => {
    reset();
    router.push("/");
  };

  return (
    <motion.div 
      variants={motionPresets.overlay}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
    >
      <motion.div 
        variants={stagger.medium}
        className="rounded-3xl bg-black/80 p-8 w-full max-w-sm text-center border border-white/20 shadow-2xl flex flex-col items-center"
      >
        <motion.h2 variants={stagger.item} className="text-3xl font-bold text-white mb-6">Puzzle Complete!</motion.h2>
        
        <motion.div variants={stagger.item} className="w-full flex justify-between px-4 mb-3 text-white/80">
          <span className="font-medium">Difficulty</span>
          <span className="text-white font-semibold capitalize">{difficulty}</span>
        </motion.div>
        
        <motion.div variants={stagger.item} className="w-full flex justify-between px-4 mb-3 text-white/80">
          <span className="font-medium">Moves</span>
          <span className="text-white font-semibold">{moveCount}</span>
        </motion.div>
        
        <motion.div variants={stagger.item} className="w-full flex justify-between px-4 mb-8 text-white/80">
          <span className="font-medium">Time</span>
          <span className="text-white font-semibold">{formattedTime}</span>
        </motion.div>
        
        <motion.div variants={stagger.item} className="w-full flex flex-col gap-3">
          <InteractionSurface onClick={restartPuzzle} magnetic className="w-full rounded-xl">
            <motion.button 
              variants={motionPresets.button}
              initial="idle" whileHover="hover" whileTap="press"
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Play Again
            </motion.button>
          </InteractionSurface>
          
          <InteractionSurface onClick={handleNewPhoto} magnetic className="w-full rounded-xl">
            <motion.button 
              variants={motionPresets.button}
              initial="idle" whileHover="hover" whileTap="press"
              className="w-full py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
            >
              New Photo
            </motion.button>
          </InteractionSurface>
          
          <InteractionSurface onClick={handleHome} magnetic className="w-full rounded-xl">
            <motion.button 
              variants={motionPresets.button}
              initial="idle" whileHover="hover" whileTap="press"
              className="w-full py-3 bg-transparent text-white/60 font-medium rounded-xl hover:bg-white/5 hover:text-white transition-colors"
            >
              Back to Home
            </motion.button>
          </InteractionSurface>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
