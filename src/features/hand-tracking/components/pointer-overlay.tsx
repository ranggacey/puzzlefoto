"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useHandTracking } from "../providers/hand-tracking-provider";
import { useHandTrackingDiagnostics } from "../store/hand-tracking-diagnostics-store";
import { FpsTracker } from "../services/fps-tracker";
import { interactionAssist } from "../services/interaction-assist";

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

  const renderFpsTracker = useRef(new FpsTracker());

  // Track Render FPS
  useEffect(() => {
    let animationFrameId: number;
    
    const renderLoop = (timestamp: number) => {
      renderFpsTracker.current.recordFrame(timestamp);
      
      if (renderFpsTracker.current.shouldUpdateStore(timestamp)) {
        const metrics = renderFpsTracker.current.getMetrics();
        if (metrics) {
          useHandTrackingDiagnostics.getState().setRenderFps(metrics);
        }
      }
      
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    
    animationFrameId = requestAnimationFrame(renderLoop);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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

  let displayX = handState.pointer.x;
  let displayY = handState.pointer.y;

  // Use InteractionAssistService to get the exact magnetic position matching the PuzzleEngine
  if (gestureState.hoveredPieceId) {
    const magneticPos = interactionAssist.applyMagneticAttraction(displayX, displayY, gestureState.hoveredPieceId);
    displayX = magneticPos.x;
    displayY = magneticPos.y;
  }

  const cursorState = (gestureState.phase === "pinching" || gestureState.phase === "pinch-start") ? "grab" :
                      gestureState.phase === "hover" ? "hover" : "idle";
  
  let cursorClasses = "rounded-full bg-white transition-all duration-300 ease-out ";
  let blurClasses = "rounded-full bg-cyan-400/50 blur-md absolute inset-0 transition-all duration-300 ease-out ";
  
  if (cursorState === "idle") {
    cursorClasses += "shadow-[0_0_10px_rgba(255,255,255,0.4)]";
    blurClasses += "opacity-50 scale-100";
  } else if (cursorState === "hover") {
    cursorClasses += "bg-white border-[3px] border-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.8)] scale-110";
    blurClasses += "scale-150 bg-cyan-400/80 animate-pulse";
  } else if (cursorState === "grab") {
    cursorClasses += "bg-cyan-300 shadow-[0_0_30px_rgba(34,211,238,1)] scale-125";
    blurClasses += "scale-[1.7] bg-cyan-300/90";
  }

  const currentSize = cursorState === "idle" ? 24 :
                      cursorState === "hover" ? 32 : 40;

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

            {/* Locked Target Connection Line (AR Style) */}
            <AnimatePresence>
              {cursorState === "grab" && gestureState.hoveredPieceId && (
                <motion.svg 
                  className="absolute inset-0 pointer-events-none z-40 overflow-visible"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.line
                    x1={`${handState.pointer.x * 100}%`}
                    y1={`${handState.pointer.y * 100}%`}
                    x2={`${displayX * 100}%`}
                    y2={`${displayY * 100}%`}
                    stroke="rgba(34,211,238,0.5)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="animate-[dash_1s_linear_infinite]"
                  />
                  <motion.circle 
                    cx={`${displayX * 100}%`} 
                    cy={`${displayY * 100}%`} 
                    r="6" 
                    fill="rgba(34,211,238,0.8)" 
                  />
                </motion.svg>
              )}
            </AnimatePresence>

            {/* Main Pointer */}
            <div
              className="absolute pointer-events-none z-50"
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
