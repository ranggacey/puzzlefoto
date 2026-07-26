"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useHandTracking } from "../providers/hand-tracking-provider";

interface TrailPoint {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

export function PointerOverlay() {
  const { handState, isReady } = useHandTracking();
  const [trail, setTrail] = useState<TrailPoint[]>([]);

  // Keep a motion trail
  useEffect(() => {
    if (handState.detected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTrail((prev) => {
        const now = Date.now();
        // Remove points older than 120ms
        const filtered = prev.filter((p) => now - p.timestamp < 120);
        // Add new point
        return [
          ...filtered,
          {
            id: now, // using timestamp as id is usually fine for 60fps
            x: handState.pointer.x,
            y: handState.pointer.y,
            timestamp: now,
          },
        ];
      });
    } else {
      setTrail([]);
    }
  }, [handState]);

  if (!isReady) return null;

  // We define the styles here as classes to prepare for future states.
  // For now, it will always be "idle" visually since hover/grab are not linked to gameplay yet.
  const cursorState: "idle" | "hover" | "grab" = "idle";
  
  let cursorClasses = "rounded-full bg-white transition-all duration-150 ease-out ";
  let blurClasses = "rounded-full bg-cyan-400/50 blur-md absolute inset-0 ";
  
  if (cursorState === "idle") {
    cursorClasses += "w-5 h-5 shadow-[0_0_10px_rgba(255,255,255,0.8)]";
  } else if (cursorState === "hover") {
    cursorClasses += "w-7 h-7 bg-transparent border-2 border-white shadow-[0_0_15px_rgba(255,255,255,1)]";
    blurClasses += "scale-125 bg-cyan-400/60";
  } else if (cursorState === "grab") {
    cursorClasses += "w-6 h-6 shadow-[0_0_20px_rgba(255,255,255,1)]";
    blurClasses += "scale-110 bg-cyan-400/70";
  }

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {handState.detected && (
          <>
            {/* Trail */}
            {trail.map((point, index) => {
              const opacity = (index + 1) / trail.length; // Fade out older points
              return (
                <div
                  key={point.id}
                  className="absolute rounded-full bg-cyan-200/40 blur-[2px] w-4 h-4 -ml-2 -mt-2 pointer-events-none"
                  style={{
                    left: `${point.x * 100}%`,
                    top: `${point.y * 100}%`,
                    opacity: opacity * 0.5,
                  }}
                />
              );
            })}

            {/* Main Pointer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
              className="absolute -ml-2.5 -mt-2.5 flex items-center justify-center pointer-events-none"
              style={{
                left: `${handState.pointer.x * 100}%`,
                top: `${handState.pointer.y * 100}%`,
              }}
            >
              <div className={blurClasses} />
              <div className={cursorClasses} />
              
              {/* Ripple Preparation (Hidden/Unused for now) */}
              <div className="absolute inset-0 rounded-full border border-white opacity-0 scale-50" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
