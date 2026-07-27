"use client";

import { motion } from "motion/react";
import { motionTokens } from "@/lib/motion";
import { useEffect, useState } from "react";

export function CalibrationOverlay() {
  const [step, setStep] = useState(0);

  const messages = [
    "Raise your hand",
    "Keep your hand inside the frame",
    "Preparing hand tracking..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-32 z-20 flex flex-col items-center justify-center">
      <div className="relative">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: motionTokens.durations.normal, ease: motionTokens.easings.smooth }}
          className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-black/60 px-6 py-3 text-center backdrop-blur-md"
        >
          <p className="text-lg font-medium text-white shadow-sm">
            {messages[step]}
          </p>
        </motion.div>
      </div>
      {/* Temporary visual indicator for hand detection zone */}
      <motion.div 
        className="mt-8 h-32 w-32 rounded-3xl border-2 border-dashed border-white/40"
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: motionTokens.easings.smooth }}
      />
    </div>
  );
}
