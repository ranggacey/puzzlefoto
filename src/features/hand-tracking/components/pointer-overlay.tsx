"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGlobalPointer } from "../providers/global-pointer-provider";
import { useHandTracking } from "../providers/hand-tracking-provider";
import { useHandTrackingDiagnostics } from "../store/hand-tracking-diagnostics-store";
import { FpsTracker } from "../services/fps-tracker";
import { motionPresets, motionTokens } from "@/lib/motion";

interface TrailPoint {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

export function PointerOverlay() {
  const { handState } = useHandTracking();
  const { pointerState } = useGlobalPointer();
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

  // Manage global cursor hiding
  useEffect(() => {
    if (pointerState.source === "hand") {
      document.body.style.cursor = "none";
    } else {
      document.body.style.cursor = "auto";
    }
  }, [pointerState.source]);

  // Keep a motion trail
  useEffect(() => {
    if (pointerState.phase !== "hidden" && pointerState.source === "hand") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTrail((prev) => {
        const now = Date.now();
        const filtered = prev.filter((p) => now - p.timestamp < 120);
        return [
          ...filtered,
          { id: now, x: pointerState.x, y: pointerState.y, timestamp: now },
        ];
      });
    } else {
      setTrail([]);
    }
  }, [pointerState.x, pointerState.y, pointerState.phase, pointerState.source]);

  const wasPressed = useRef(false);
  // Handle Drop Ripple
  useEffect(() => {
    if (pointerState.phase === "pressed" || pointerState.phase === "dragging") {
      wasPressed.current = true;
    } else if (wasPressed.current && (pointerState.phase === "idle" || pointerState.phase === "hover")) {
      wasPressed.current = false;
      setRipple({
        id: Date.now(),
        x: pointerState.x,
        y: pointerState.y
      });
    }
  }, [pointerState.phase, pointerState.x, pointerState.y]);

  if (pointerState.phase === "hidden") return null;

  const displayX = pointerState.x;
  const displayY = pointerState.y;

  const cursorState = pointerState.phase === "pressed" || pointerState.phase === "dragging" ? "grab" :
                      pointerState.phase === "hover" ? "hover" : "idle";

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

            {/* Pointer overlay no longer renders the connection line here. 
                The puzzle pieces will handle their own locked connections or we can rely on standard dragging visual. */}

            {/* Main Pointer */}
            <div
              className="absolute pointer-events-none z-50"
              style={{
                left: `${displayX * 100}%`,
                top: `${displayY * 100}%`,
              }}
            >
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={motionPresets.overlay}
                className="flex items-center justify-center relative -translate-x-1/2 -translate-y-1/2"
              >
                <motion.div 
                  className="rounded-full bg-cyan-400 absolute inset-0 blur-md"
                  animate={{
                     scale: cursorState === "hover" ? 1.5 : cursorState === "grab" ? 1.7 : 1,
                     opacity: cursorState === "idle" ? 0.5 : 0.8
                  }}
                  transition={motionTokens.springs.pointer}
                />
                <motion.div 
                  className="rounded-full bg-cyan-200 relative" 
                  style={{ width: 24, height: 24 }} // Base size
                  variants={motionPresets.pointer}
                  initial="idle"
                  animate={cursorState}
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
                  transition={{ duration: motionTokens.durations.slow, ease: motionTokens.easings.exit }}
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
