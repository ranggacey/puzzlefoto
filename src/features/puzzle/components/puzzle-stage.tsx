import React from "react";
import { usePuzzleStore } from "@/store/puzzle-store";
import { motion, AnimatePresence } from "motion/react";

export function PuzzleStage({ children }: { children: React.ReactNode }) {
  const scene = usePuzzleStore((s) => s.scene);
  
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
      {children}
      
      {/* Soft Flash Effect */}
      <AnimatePresence>
        {scene === "freeze" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute inset-0 z-50 bg-white"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
