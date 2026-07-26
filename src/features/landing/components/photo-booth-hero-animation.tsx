"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Camera } from "lucide-react";

type MockMode = "single" | "filmStrip" | "grid";

export function PhotoBoothHeroAnimation() {
  const shouldReduceMotion = useReducedMotion();
  const [mode, setMode] = useState<MockMode>("single");
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const sequence = [
      { mode: "single" as MockMode, duration: 3000 },
      { flash: true, duration: 150 },
      { mode: "filmStrip" as MockMode, duration: 3000 },
      { flash: true, duration: 150 },
      { mode: "grid" as MockMode, duration: 3000 },
      { flash: true, duration: 150 },
    ];

    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const runSequence = () => {
      const step = sequence[currentIndex];
      
      if (step.flash) {
        setFlash(true);
        setTimeout(() => setFlash(false), step.duration);
      } else if (step.mode) {
        setMode(step.mode);
      }

      currentIndex = (currentIndex + 1) % sequence.length;
      timeoutId = setTimeout(runSequence, step.duration);
    };

    timeoutId = setTimeout(runSequence, 1000);
    return () => clearTimeout(timeoutId);
  }, [shouldReduceMotion]);

  const renderLayout = () => {
    if (mode === "single") {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="relative aspect-[4/3] w-full rounded-2xl bg-muted overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900" />
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Camera className="w-16 h-16" />
          </div>
        </motion.div>
      );
    }

    if (mode === "filmStrip") {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex w-full max-w-[200px] flex-col gap-3 bg-white p-3 shadow-xl rounded-xl mx-auto"
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900" />
            </div>
          ))}
          <div className="flex h-8 items-center justify-center border-t-2 border-black/10">
            <span className="text-[10px] font-black tracking-widest text-black/40">VISION</span>
          </div>
        </motion.div>
      );
    }

    if (mode === "grid") {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="grid aspect-square w-full max-w-[300px] grid-cols-2 grid-rows-2 gap-2 bg-black p-2 mx-auto rounded-xl"
        >
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative h-full w-full bg-muted overflow-hidden rounded-md">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900" />
            </div>
          ))}
        </motion.div>
      );
    }
  };

  return (
    <div className="relative flex aspect-square w-full max-w-md items-center justify-center overflow-hidden rounded-3xl bg-card border border-border shadow-2xl p-8">
      <AnimatePresence mode="wait">
        {renderLayout()}
      </AnimatePresence>

      {/* Flash Effect */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="pointer-events-none absolute inset-0 z-50 bg-white"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
