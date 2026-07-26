"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { usePuzzleCameraContext } from "@/features/puzzle/providers/puzzle-camera-provider";
import { handTrackingService } from "../services/hand-tracking-service";
import { PointerSmoothing } from "../services/pointer-smoothing";
import type { HandState } from "../types/hand-state";

interface HandTrackingContextType {
  isReady: boolean;
  handState: HandState;
}

const initialHandState: HandState = {
  detected: false,
  pointer: { x: 0, y: 0 },
  landmarks: [],
  handedness: "right",
  confidence: 0,
  pinch: false,
};

const HandTrackingContext = createContext<HandTrackingContextType | null>(null);

export function HandTrackingProvider({ children }: { children: React.ReactNode }) {
  const camera = usePuzzleCameraContext();
  const [isReady, setIsReady] = useState(false);
  const [handState, setHandState] = useState<HandState>(initialHandState);
  
  const animationFrameRef = useRef<number | null>(null);
  const pointerSmoothing = useRef(new PointerSmoothing(0.3));

  useEffect(() => {
    let active = true;

    async function initService() {
      try {
        await handTrackingService.initialize();
        if (active) {
          setIsReady(true);
        }
      } catch (err) {
        console.error("Failed to initialize hand tracking", err);
      }
    }
    
    initService();

    return () => {
      active = false;
      handTrackingService.close();
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const video = camera.getVideoElement();
    if (!video) return;

    // We need to wait for video to actually have dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      // It might not be playing yet. Wait and retry or just let the loop handle it
    }

    const loop = () => {
      // Ensure video is valid
      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        const result = handTrackingService.detectForVideo(video, performance.now());
        
        if (result && result.landmarks && result.landmarks.length > 0) {
          const landmarks = result.landmarks[0];
          const handedness = result.handedness[0]?.[0]?.categoryName === "Left" ? "left" : "right";
          const confidence = result.handedness[0]?.[0]?.score ?? 0;
          
          // Index finger tip is landmark 8
          const indexFingertip = landmarks[8];
          
          // The results from mediapipe are normalized [0, 1] relative to the video feed.
          // Since our video is mirrored via CSS (`scale-x-[-1]`), we must mirror the X coordinate 
          // to match the screen visual.
          const rawX = 1 - indexFingertip.x;
          const rawY = indexFingertip.y;
          
          const smoothed = pointerSmoothing.current.smooth(rawX, rawY);

          setHandState({
            detected: true,
            pointer: smoothed,
            landmarks,
            handedness,
            confidence,
            pinch: false, // Prep for future sprint
          });
        } else {
          // No hand detected
          pointerSmoothing.current.reset();
          setHandState(prev => prev.detected ? { ...prev, detected: false } : prev);
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isReady, camera]);

  return (
    <HandTrackingContext.Provider value={{ isReady, handState }}>
      {children}
    </HandTrackingContext.Provider>
  );
}

export function useHandTracking() {
  const ctx = useContext(HandTrackingContext);
  if (!ctx) throw new Error("useHandTracking must be used within a HandTrackingProvider");
  return ctx;
}
