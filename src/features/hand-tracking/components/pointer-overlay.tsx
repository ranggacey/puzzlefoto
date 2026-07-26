"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useHandTracking } from "../providers/hand-tracking-provider";
import { usePuzzleStore } from "@/store/puzzle-store";
import { DIFFICULTY_PRESETS } from "@/features/puzzle/constants/puzzle-difficulty";
import { InteractionConfig } from "../constants/interaction-config";

interface TrailPoint {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

export function PointerOverlay() {
  const { handState, gestureState, isReady } = useHandTracking();
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [ripple, setRipple] = useState<{ id: number, x: number, y: number } | null>(null);

  const pieces = usePuzzleStore(state => state.pieces);
  const difficulty = usePuzzleStore(state => state.difficulty);

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

  // Handle Drop Ripple
  useEffect(() => {
    if (gestureState.phase === "pinch-end") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRipple({
        id: Date.now(),
        x: handState.pointer.x,
        y: handState.pointer.y
      });
    }
  }, [gestureState.phase, handState.pointer.x, handState.pointer.y]);

  if (!isReady) return null;

  // Calculate magnetic pointer
  let displayX = handState.pointer.x;
  let displayY = handState.pointer.y;

  if (gestureState.hoveredPieceId && !gestureState.pinching) {
    const piece = pieces.find(p => p.id === gestureState.hoveredPieceId);
    if (piece && !piece.isLocked) {
      const { columns, rows } = DIFFICULTY_PRESETS[difficulty];
      const col = piece.currentSlotIndex % columns;
      const row = Math.floor(piece.currentSlotIndex / columns);
      
      const centerX = (col + 0.5) / columns;
      const centerY = (row + 0.5) / rows;
      
      const pull = InteractionConfig.magneticStrength;
      displayX = displayX + (centerX - displayX) * pull;
      displayY = displayY + (centerY - displayY) * pull;
    }
  }

  const cursorState = (gestureState.phase === "pinching" || gestureState.phase === "pinch-start") ? "grab" :
                      gestureState.phase === "hover" ? "hover" : "idle";
  
  let cursorClasses = "rounded-full bg-white transition-all duration-300 ease-out ";
  let blurClasses = "rounded-full bg-cyan-400/50 blur-md absolute inset-0 transition-all duration-300 ease-out ";
  
  if (cursorState === "idle") {
    // Tailwind dynamic classes like w-[24px] will only work if safelisted or parsed.
    // Instead we'll use inline styles for the exact dimensions, and classes for the rest.
    cursorClasses += "shadow-[0_0_10px_rgba(255,255,255,0.8)]";
  } else if (cursorState === "hover") {
    cursorClasses += "bg-transparent border-2 border-white shadow-[0_0_15px_rgba(255,255,255,1)]";
    blurClasses += "scale-125 bg-cyan-400/60";
  } else if (cursorState === "grab") {
    cursorClasses += "shadow-[0_0_20px_rgba(255,255,255,1)]";
    blurClasses += "scale-110 bg-cyan-400/70";
  }

  const currentSize = cursorState === "idle" ? InteractionConfig.pointerSize.idle :
                      cursorState === "hover" ? InteractionConfig.pointerSize.hover :
                      InteractionConfig.pointerSize.grab;

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
                    opacity: opacity * (cursorState === "grab" ? 0.8 : 0.5),
                  }}
                />
              );
            })}

            {/* Main Pointer */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${displayX * 100}%`,
                top: `${displayY * 100}%`,
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5, x: "-50%", y: "-50%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.5, x: "-50%", y: "-50%" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex items-center justify-center relative"
              >
                <div className={blurClasses} />
                <div 
                  className={cursorClasses} 
                  style={{ width: currentSize, height: currentSize }}
                />
              </motion.div>
            </div>
            
            {/* Drop Ripple */}
            <AnimatePresence>
              {ripple && (
                <motion.div
                  key={ripple.id}
                  initial={{ opacity: 1, scale: 0 }}
                  animate={{ opacity: 0, scale: 4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute -ml-6 -mt-6 w-12 h-12 rounded-full border-2 border-white pointer-events-none"
                  style={{
                    left: `${ripple.x * 100}%`,
                    top: `${ripple.y * 100}%`,
                  }}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
