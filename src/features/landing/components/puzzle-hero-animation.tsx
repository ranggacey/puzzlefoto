"use client";

import { motion, useReducedMotion } from "motion/react";

export function PuzzleHeroAnimation() {
  const shouldReduceMotion = useReducedMotion();

  // Create a 3x3 grid of pieces
  const pieces = Array.from({ length: 9 }).map((_, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    return { id: i, row, col };
  });

  // If reduced motion, render a static version
  if (shouldReduceMotion) {
    return (
      <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-muted/10 p-4 sm:p-8 shadow-2xl">
        <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-1">
          {pieces.map((piece) => (
            <div
              key={piece.id}
              className="relative h-full w-full overflow-hidden rounded-md shadow-sm"
              style={{
                backgroundImage: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
                backgroundSize: "300% 300%",
                backgroundPosition: `${piece.col * 50}% ${piece.row * 50}%`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-muted/10 p-4 sm:p-8 shadow-2xl">
      <motion.div 
        className="grid h-full w-full grid-cols-3 grid-rows-3"
        // Animation sequence for the grid gap (cracks forming -> floating -> reassembling)
        animate={{
          gap: ["0px", "0px", "2px", "16px", "20px", "16px", "2px", "0px", "0px"]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        {pieces.map((piece) => {
          // Calculate explode directions outward from center
          const xDir = (piece.col - 1) * 30; // -30, 0, 30
          const yDir = (piece.row - 1) * 30; // -30, 0, 30
          
          // Randomize rotation slightly for organic feel
          const rotateDir = (piece.col - 1) * (piece.row - 1) * 15 || (piece.id % 2 === 0 ? 12 : -12);

          return (
            <motion.div
              key={piece.id}
              className="relative h-full w-full overflow-hidden rounded-md shadow-sm"
              style={{
                backgroundImage: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
                backgroundSize: "300% 300%",
                backgroundPosition: `${piece.col * 50}% ${piece.row * 50}%`,
              }}
              animate={{
                x: [0, 0, xDir * 0.1, xDir, xDir * 1.1, xDir, xDir * 0.1, 0, 0],
                y: [0, 0, yDir * 0.1, yDir, yDir * 1.1, yDir, yDir * 0.1, 0, 0],
                rotate: [0, 0, 0, rotateDir, rotateDir * 1.1, rotateDir, 0, 0, 0],
                scale: [1, 1, 0.98, 0.92, 0.94, 0.92, 0.98, 1, 1],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          );
        })}
      </motion.div>
    </div>
  );
}
