import React from "react";
import { motion } from "motion/react";
import { usePuzzleStore } from "@/store/puzzle-store";
import { useRouter } from "next/navigation";

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
        className="rounded-3xl bg-black/80 p-8 w-full max-w-sm text-center border border-white/20 shadow-2xl flex flex-col items-center"
      >
        <h2 className="text-3xl font-bold text-white mb-6">Puzzle Complete!</h2>
        
        <div className="w-full flex justify-between px-4 mb-3 text-white/80">
          <span className="font-medium">Difficulty</span>
          <span className="text-white font-semibold capitalize">{difficulty}</span>
        </div>
        
        <div className="w-full flex justify-between px-4 mb-3 text-white/80">
          <span className="font-medium">Moves</span>
          <span className="text-white font-semibold">{moveCount}</span>
        </div>
        
        <div className="w-full flex justify-between px-4 mb-8 text-white/80">
          <span className="font-medium">Time</span>
          <span className="text-white font-semibold">{formattedTime}</span>
        </div>
        
        <div className="w-full flex flex-col gap-3">
          <button 
            onClick={restartPuzzle}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Play Again
          </button>
          
          <button 
            onClick={handleNewPhoto}
            className="w-full py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
          >
            New Photo
          </button>
          
          <button 
            onClick={handleHome}
            className="w-full py-3 bg-transparent text-white/60 font-medium rounded-xl hover:bg-white/5 hover:text-white transition-colors"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
