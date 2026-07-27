"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

export type InputSource = "mouse" | "touch" | "hand";
export type PointerPhase = "hidden" | "idle" | "hover" | "pressed" | "dragging" | "disabled";

export interface PointerState {
  x: number; // Normalized [0, 1] relative to screen
  y: number; // Normalized [0, 1] relative to screen
  phase: PointerPhase;
  source: InputSource;
  hoveredSurfaceId: string | null;
}

export interface InteractionSurfaceCallbacks {
  onHoverEnter?: () => void;
  onHoverLeave?: () => void;
  onPress?: (x?: number, y?: number) => void;
  onRelease?: () => void;
}

export interface RegisteredSurface {
  id: string;
  element: HTMLElement;
  priority: number;
  callbacks: InteractionSurfaceCallbacks;
  magnetic?: boolean;
}

interface GlobalPointerContextValue {
  pointerState: PointerState;
  setPointerState: React.Dispatch<React.SetStateAction<PointerState>>;
  registerSurface: (surface: RegisteredSurface) => void;
  unregisterSurface: (id: string) => void;
  getSurfaces: () => RegisteredSurface[];
}

const GlobalPointerContext = createContext<GlobalPointerContextValue | null>(null);

export function GlobalPointerProvider({ children }: { children: React.ReactNode }) {
  const [pointerState, setPointerState] = useState<PointerState>({
    x: 0.5,
    y: 0.5,
    phase: "hidden",
    source: "mouse",
    hoveredSurfaceId: null,
  });

  const setPointerStateWithLogging = useCallback((updater: React.SetStateAction<PointerState>) => {
    setPointerState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
  }, []);

  const surfacesRef = useRef<Map<string, RegisteredSurface>>(new Map());

  const registerSurface = useCallback((surface: RegisteredSurface) => {
    surfacesRef.current.set(surface.id, surface);
  }, []);

  const unregisterSurface = useCallback((id: string) => {
    surfacesRef.current.delete(id);
  }, []);

  const getSurfaces = useCallback(() => {
    return Array.from(surfacesRef.current.values());
  }, []);

  // Listen for native mouse movement to switch input source and update position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPointerStateWithLogging((prev) => {
        return {
          ...prev,
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
          source: "mouse",
          phase: prev.source === "hand" ? "hidden" : prev.phase // Hide AR cursor if switching from hand
        };
      });
    };

    const handleMouseDown = () => {
      setPointerStateWithLogging((prev) => prev.source === "mouse" ? { ...prev, phase: "pressed" } : prev);
    };

    const handleMouseUp = () => {
      setPointerStateWithLogging((prev) => prev.source === "mouse" ? { ...prev, phase: "hover" } : prev);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [setPointerStateWithLogging]);

  return (
    <GlobalPointerContext.Provider
      value={{
        pointerState,
        setPointerState: setPointerStateWithLogging,
        registerSurface,
        unregisterSurface,
        getSurfaces,
      }}
    >
      {children}
    </GlobalPointerContext.Provider>
  );
}

export function useGlobalPointer() {
  const context = useContext(GlobalPointerContext);
  if (!context) {
    throw new Error("useGlobalPointer must be used within a GlobalPointerProvider");
  }
  return context;
}
