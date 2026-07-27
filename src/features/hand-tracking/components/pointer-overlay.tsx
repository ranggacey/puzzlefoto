"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGlobalPointer } from "../providers/global-pointer-provider";
import { useHandTracking } from "../providers/hand-tracking-provider";
import { useHandTrackingDiagnostics } from "../store/hand-tracking-diagnostics-store";
import { FpsTracker } from "../services/fps-tracker";

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
