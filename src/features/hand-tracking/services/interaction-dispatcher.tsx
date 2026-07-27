"use client";

import { useEffect, useRef } from "react";
import { useHandTracking } from "@/features/hand-tracking/providers/hand-tracking-provider";
import { useGlobalPointer, RegisteredSurface, PointerPhase, PointerState } from "../providers/global-pointer-provider";
import { InteractionLogger } from "@/lib/debug/interaction-logger";

export function InteractionDispatcher() {
  const { handState, gestureState } = useHandTracking();
  const { setPointerState, getSurfaces } = useGlobalPointer();

  const activeSurfaceId = useRef<string | null>(null);
  const isPinching = useRef<boolean>(false);

  useEffect(() => {
    // 1. Calculate base pointer position
    let x = handState.pointer.x;
    let y = handState.pointer.y;
    let phase: PointerPhase = "idle";
    let hoveredSurfaceId: string | null = null;

    if (!handState.detected) {
      phase = "hidden";
      if (activeSurfaceId.current) {
        const surface = getSurfaces().find((s: RegisteredSurface) => s.id === activeSurfaceId.current);
        if (surface) {
          surface.callbacks.onHoverLeave?.();
          if (isPinching.current) surface.callbacks.onRelease?.();
        }
        activeSurfaceId.current = null;
        isPinching.current = false;
      }
      
      // Update global pointer to hidden if hand is lost, BUT ONLY if source is hand
      setPointerState((prev: PointerState) => prev.source === "hand" ? { ...prev, phase: "hidden" } : prev);
      return;
    }

    // 2. Perform Hit Testing
    const px = x * window.innerWidth;
    const py = y * window.innerHeight;

    let targetSurface: RegisteredSurface | undefined;
    
    // If we are actively pressing something, we CAPTURE the pointer
    // so it doesn't swap to another surface while dragging/holding
    if (isPinching.current && activeSurfaceId.current) {
      targetSurface = getSurfaces().find((s: RegisteredSurface) => s.id === activeSurfaceId.current);
    } else {
      // Find highest priority surface that contains the point
      const surfaces = getSurfaces().sort((a: RegisteredSurface, b: RegisteredSurface) => b.priority - a.priority);
      for (const surface of surfaces) {
        const rect = surface.element.getBoundingClientRect();
        const padding = surface.magnetic ? 15 : 0;
        
        if (
          px >= rect.left - padding &&
          px <= rect.right + padding &&
          py >= rect.top - padding &&
          py <= rect.bottom + padding
        ) {
          // Additional check: Ensure it's not hidden (e.g. display: none)
          if (rect.width > 0 && rect.height > 0) {
            targetSurface = surface;
            break;
          }
        }
      }
    }

    // 3. Apply Light Magnetic Assistance
    if (targetSurface?.magnetic) {
      const rect = targetSurface.element.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      
      const ncx = cx / window.innerWidth;
      const ncy = cy / window.innerHeight;
      
      // Use lighter magnetic pull for UI compared to puzzle pieces
      const pull = gestureState.pinching ? 0.25 : 0.15;
      x = x + (ncx - x) * pull;
      y = y + (ncy - y) * pull;
    }

    hoveredSurfaceId = targetSurface?.id || null;
    phase = gestureState.pinching ? "pressed" : hoveredSurfaceId ? "hover" : "idle";

    // 4. Update Global Pointer State
    setPointerState({
      x,
      y,
      phase,
      source: "hand",
      hoveredSurfaceId,
    });

    // 5. Lifecycle Routing (Hover & Press)
    const prevId = activeSurfaceId.current;
    
    if (prevId !== hoveredSurfaceId && !isPinching.current) {
      if (prevId) {
        const prevSurface = getSurfaces().find((s: RegisteredSurface) => s.id === prevId);
        prevSurface?.callbacks.onHoverLeave?.();
      }
      if (hoveredSurfaceId && targetSurface) {
        InteractionLogger.logDecision("InteractionDispatcher", "Surface Hovered", [
          `✔ Surface ID: ${targetSurface.id}`,
          `✔ Highest priority (${targetSurface.priority})`,
          `✔ Pointer inside bounds`
        ]);
        targetSurface.callbacks.onHoverEnter?.();
      } else if (!hoveredSurfaceId) {
        InteractionLogger.logDecision("InteractionDispatcher", "Hover Cleared", [
          `✖ Pointer outside every bounding box`
        ]);
      }
      activeSurfaceId.current = hoveredSurfaceId;
    }

    // Handle Press/Release transitions
    // Because gestureState.phase gives us precise pinch-start/pinch-end, we can trigger actions reliably
    if (gestureState.phase === "pinch-start" && !isPinching.current) {
      isPinching.current = true;
      if (targetSurface) {
        const hasOnPress = !!targetSurface.callbacks.onPress;
        InteractionLogger.logDecision("InteractionDispatcher", "Surface Pressed", [
          `✔ Surface ID: ${targetSurface.id}`,
          `✔ Coordinates: (${x.toFixed(3)}, ${y.toFixed(3)})`,
          `ℹ onPress exists: ${hasOnPress}`,
          hasOnPress ? `ℹ calling onPress...` : `✖ onPress is undefined`
        ]);
        targetSurface.callbacks.onPress?.(x, y);
      } else {
        InteractionLogger.logDecision("InteractionDispatcher", "Press Ignored", [
          `✖ Pointer outside every interactive surface`
        ]);
      }
    } else if (gestureState.phase === "pinch-end" && isPinching.current) {
      isPinching.current = false;
      if (targetSurface) {
        InteractionLogger.logDecision("InteractionDispatcher", "Surface Released", [
          `✔ Surface ID: ${targetSurface.id}`
        ]);
        targetSurface.callbacks.onRelease?.();
      }
    }

  }, [handState, gestureState, getSurfaces, setPointerState]);

  return null;
}
