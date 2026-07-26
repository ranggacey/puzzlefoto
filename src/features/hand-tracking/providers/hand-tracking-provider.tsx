"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { usePuzzleCameraContext } from "@/features/puzzle/providers/puzzle-camera-provider";
import { handTrackingService } from "../services/hand-tracking-service";
import { PointerSmoothing } from "../services/pointer-smoothing";
import { GestureRecognizer } from "../services/gesture-recognizer";
import { HandTrackingConfidenceFilter } from "../services/confidence-filter";
import { InteractionConfig } from "../constants/interaction-config";
import { useHandTrackingDiagnostics } from "../store/hand-tracking-diagnostics-store";
import { FpsTracker } from "../services/fps-tracker";
import { trackingDiagnostics } from "../services/diagnostics-service";
import type { HandState } from "../types/hand-state";
import type { GestureState, HitTester, NormalizedPointerEvent } from "../types/gesture-state";

interface HandTrackingContextType {
  isReady: boolean;
  handState: HandState;
  gestureState: GestureState;
  registerGestureCallbacks: (onEvent: (e: NormalizedPointerEvent) => void, hitTester: HitTester) => void;
}

const initialHandState: HandState = {
  detected: false,
  pointer: { x: 0, y: 0 },
  landmarks: [],
  handedness: "right",
  confidence: 0,
  pinch: false,
};

const initialGestureState: GestureState = {
  hovering: false,
  pinching: false,
  phase: "idle",
};

const HandTrackingContext = createContext<HandTrackingContextType | null>(null);

export function HandTrackingProvider({ children }: { children: React.ReactNode }) {
  const camera = usePuzzleCameraContext();
  const [isReady, setIsReady] = useState(false);
  const [handState, setHandState] = useState<HandState>(initialHandState);
  const [gestureState, setGestureState] = useState<GestureState>(initialGestureState);
  
  const animationFrameRef = useRef<number | null>(null);
  const pointerSmoothing = useRef(new PointerSmoothing());
  const gestureRecognizer = useRef(new GestureRecognizer());
  const confidenceFilter = useRef(new HandTrackingConfidenceFilter());
  const inferenceFpsTracker = useRef(new FpsTracker());
  const lastDetectedTime = useRef<number>(0);
  const lastValidState = useRef<HandState | null>(null);

  const registerGestureCallbacks = React.useCallback((
    onEvent: (e: NormalizedPointerEvent) => void,
    hitTester: HitTester
  ) => {
    gestureRecognizer.current.setCallbacks(onEvent, hitTester);
  }, []);

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
    } else {
      const stream = video.srcObject as MediaStream;
      if (stream) {
        const track = stream.getVideoTracks()[0];
        if (track) {
          const settings = track.getSettings();
          useHandTrackingDiagnostics.getState().setCameraDiagnostics({
            width: settings.width || video.videoWidth,
            height: settings.height || video.videoHeight,
            frameRate: settings.frameRate || 0,
            facingMode: settings.facingMode,
            deviceId: settings.deviceId,
          });
        }
      }
    }

    const loop = () => {
      // Ensure video is valid
      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        const t0 = performance.now();
        const result = handTrackingService.detectForVideo(video, t0);
        const t1 = performance.now();
        
        inferenceFpsTracker.current.recordFrame(t1);
        if (inferenceFpsTracker.current.shouldUpdateStore(t1)) {
          const metrics = inferenceFpsTracker.current.getMetrics();
          if (metrics) {
            useHandTrackingDiagnostics.getState().setInferenceFps(metrics);
          }
        }
        
        if (result && result.landmarks && result.landmarks.length > 0) {
          const rawLandmarks = result.landmarks[0];
          const landmarks = confidenceFilter.current.filter(rawLandmarks);
          
          if (landmarks) {
            const handedness = (result.handedness[0]?.[0]?.categoryName === "Left" ? "left" : "right") as "left" | "right";
            const confidence = result.handedness[0]?.[0]?.score ?? 0;
            
            trackingDiagnostics.recordConfidence(confidence);
            trackingDiagnostics.recordTrackingRecovery();
            
            // Index finger tip is landmark 8
            const indexFingertip = landmarks[8];
            
            // The results from mediapipe are normalized [0, 1] relative to the video feed.
            // Since our video is mirrored via CSS (`scale-x-[-1]`), we must mirror the X coordinate 
            // to match the screen visual.
            const rawX = 1 - indexFingertip.x;
            const rawY = indexFingertip.y;
            
            const smoothed = pointerSmoothing.current.smooth(rawX, rawY);

            const newState = {
              detected: true,
              pointer: smoothed,
              landmarks,
              handedness,
              confidence,
              pinch: false,
            };
            
            lastDetectedTime.current = performance.now();
            lastValidState.current = newState;
            
            setHandState(newState);

            // Process gestures
            const gState = gestureRecognizer.current.process(newState, performance.now());
            setGestureState(gState);
          } else {
            // Filter rejected this frame (impossible jump), handle as missing frame
            handleMissingFrame("Impossible landmark jump (Confidence Filter)");
          }
        } else {
          // Tracking lost - check persistence
          handleMissingFrame("No landmarks detected");
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    const handleMissingFrame = (reason: string) => {
      const timeSinceLastDetection = performance.now() - lastDetectedTime.current;
      
      if (lastValidState.current && timeSinceLastDetection < InteractionConfig.trackingPersistenceMs) {
        // Keep the last valid state and feed it to gesture recognizer to allow it to apply its own grab persistence
        setHandState(lastValidState.current);
        const gState = gestureRecognizer.current.process(lastValidState.current, performance.now());
        setGestureState(gState);
      } else {
        // Persistence expired, actually lose tracking
        trackingDiagnostics.recordTrackingLoss(reason);
        pointerSmoothing.current.reset();
        confidenceFilter.current.reset();
        const emptyState = { ...initialHandState, detected: false };
        lastValidState.current = null;
        setHandState(emptyState);
        const gState = gestureRecognizer.current.process(emptyState, performance.now());
        setGestureState(gState);
      }
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isReady, camera]);

  return (
    <HandTrackingContext.Provider value={{ isReady, handState, gestureState, registerGestureCallbacks }}>
      {children}
    </HandTrackingContext.Provider>
  );
}

export function useHandTracking() {
  const ctx = useContext(HandTrackingContext);
  if (!ctx) throw new Error("useHandTracking must be used within a HandTrackingProvider");
  return ctx;
}
