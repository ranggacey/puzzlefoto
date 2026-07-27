"use client";

import React, { useRef, useEffect, useState, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGlobalPointer } from "../providers/global-pointer-provider";
import { cn } from "@/lib/utils";

interface InteractionSurfaceProps {
  id?: string;
  children: React.ReactNode;
  magnetic?: boolean;
  priority?: number;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  activeScale?: number;
  hoverScale?: number;
}

export function InteractionSurface({
  id: providedId,
  children,
  magnetic = true,
  priority = 10,
  onClick,
  className,
  disabled = false,
  activeScale = 0.95,
  hoverScale = 1.05,
}: InteractionSurfaceProps) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const ref = useRef<HTMLDivElement>(null);
  const { registerSurface, unregisterSurface, pointerState } = useGlobalPointer();

  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (!ref.current) return;

    registerSurface({
      id,
      element: ref.current,
      priority,
      magnetic,
      callbacks: {
        onHoverEnter: () => {
          if (!disabled) setIsHovered(true);
        },
        onHoverLeave: () => {
          setIsHovered(false);
          setIsPressed(false);
        },
        onPress: () => {
          if (!disabled) setIsPressed(true);
        },
        onRelease: () => {
          if (!disabled) {
            setIsPressed(false);
            
            // Add ripple exactly in center since hand tracking doesn't give a reliable click coordinate relative to element
            const rect = ref.current?.getBoundingClientRect();
            if (rect) {
              setRipples((prev) => [
                ...prev,
                { id: Date.now(), x: rect.width / 2, y: rect.height / 2 },
              ]);
            }
            
            onClick?.();
          }
        },
      },
    });

    return () => {
      unregisterSurface(id);
    };
  }, [id, priority, magnetic, disabled, registerSurface, unregisterSurface, onClick]);

  // Handle native mouse events (only if active input source is mouse)
  const handleMouseEnter = () => {
    if (pointerState.source === "mouse" && !disabled) setIsHovered(true);
  };
  const handleMouseLeave = () => {
    if (pointerState.source === "mouse") {
      setIsHovered(false);
      setIsPressed(false);
    }
  };
  const handleMouseDown = () => {
    if (pointerState.source === "mouse" && !disabled) setIsPressed(true);
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (pointerState.source === "mouse" && !disabled) {
      setIsPressed(false);
      
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        setRipples((prev) => [
          ...prev,
          { id: Date.now(), x: e.clientX - rect.left, y: e.clientY - rect.top },
        ]);
      }
      
      onClick?.();
    }
  };

  return (
    <motion.div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      animate={{
        scale: disabled ? 1 : isPressed ? activeScale : isHovered ? hoverScale : 1,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative flex shrink-0 items-center justify-center isolate",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className
      )}
    >
      {/* Hover Glow */}
      <AnimatePresence>
        {isHovered && !disabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -inset-2 -z-10 rounded-[inherit] bg-cyan-400/20 blur-md pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Ripple Effect */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ opacity: 0.6, scale: 0 }}
            animate={{ opacity: 0, scale: 2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute rounded-full bg-white/40 pointer-events-none z-10"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 100,
              height: 100,
              marginLeft: -50,
              marginTop: -50,
            }}
            onAnimationComplete={() => {
              setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
            }}
          />
        ))}
      </AnimatePresence>

      <div className="w-full h-full rounded-[inherit] overflow-hidden">
         {children}
      </div>
    </motion.div>
  );
}
