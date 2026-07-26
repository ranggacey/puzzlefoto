"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { CameraState, CameraContextType } from "@/features/photo-booth/types/camera";
import { cameraService } from "@/services/camera.service";
import { captureService } from "@/services/capture.service";
import { cameraDebug, cameraWarn, startCameraTimer, endCameraTimer } from "@/features/photo-booth/utils/camera-debug";

const PuzzleCameraContext = createContext<CameraContextType | null>(null);

export function PuzzleCameraProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CameraState>("IDLE");
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const startAttemptRef = useRef(0);

  // Helper to log state transitions
  const setCameraState = useCallback((newState: CameraState) => {
    setState((prevState) => {
      if (prevState !== newState) {
        cameraDebug(`[PuzzleCamera] state:\n${prevState} -> ${newState}`);
      }
      return newState;
    });
  }, []);

  const start = useCallback(async () => {
    cameraDebug("[PuzzleCamera] start() called");
    const attempt = ++startAttemptRef.current;
    
    setCameraState("STARTING");
    setError(null);
    
    try {
      // Idempotent start: do not re-initialize if we already have an active stream
      if (activeStreamRef.current) {
        cameraDebug("[PuzzleCamera] start() called but stream already exists. Skipping.");
        setCameraState("READY");
        return;
      }

      startCameraTimer("startToReady");
      const stream = await cameraService.openStream(null, "user"); // Always user-facing for puzzle
      
      if (attempt !== startAttemptRef.current) {
        cameraWarn("[PuzzleCamera] discarding stream due to newer start attempt");
        cameraService.stopStream(stream);
        return;
      }

      activeStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        startCameraTimer("videoPlay");
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => cameraWarn("[PuzzleCamera] Video play interrupted:", e));
        }
      }

      setCameraState("READY");
      endCameraTimer("startToReady");
    } catch (err: unknown) {
      if (attempt !== startAttemptRef.current) return;
      
      if (err instanceof Error) {
        if (err.message.includes("aborted")) return; 
        setError(err.message || "Failed to start camera");
        setCameraState("ERROR");
      } else {
        setError("Failed to start camera");
        setCameraState("ERROR");
      }
    }
  }, [setCameraState]);

  const stop = useCallback(() => {
    cameraDebug("[PuzzleCamera] stop() called");
    startAttemptRef.current++;
    setCameraState("STOPPING");
    
    if (activeStreamRef.current) {
      cameraService.stopStream(activeStreamRef.current);
      activeStreamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState("STOPPED");
  }, [setCameraState]);

  const restart = useCallback(async () => {
    stop();
    return start();
  }, [stop, start]);

  const attachVideo = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    
    if (element && activeStreamRef.current) {
      if (element.srcObject !== activeStreamRef.current) {
        element.srcObject = activeStreamRef.current;
        const playPromise = element.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => cameraWarn("[PuzzleCamera] Video play interrupted:", e));
        }
      }
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    start();
    return () => {
      stop();
    };
  }, [start, stop]);

  const capture = useCallback(async () => {
    if (!videoRef.current) return null;
    
    try {
      const dataUrl = await captureService.captureFrame(videoRef.current, {
        format: "dataUrl",
        mirror: true
      });
      
      if (!dataUrl || typeof dataUrl !== "string") {
        throw new Error("Failed to capture valid image data");
      }
      
      return dataUrl;
    } catch (err) {
      cameraWarn("[PuzzleCamera] capture failed:", err);
      return null;
    }
  }, []);

  const switchCamera = useCallback(() => {}, []);

  const contextValue = React.useMemo(() => ({
    state,
    devices: [],
    deviceId: null,
    facingMode: "user" as const,
    error,
    start,
    stop,
    restart,
    capture,
    switchCamera,
    attachVideo
  }), [state, error, start, stop, restart, capture, switchCamera, attachVideo]);

  // We mock out irrelevant context methods for Puzzle (capture, switchCamera)
  // to satisfy CameraContextType since HandTracking only needs the stream, 
  // but if needed we can define a dedicated PuzzleCameraContextType later.
  return (
    <PuzzleCameraContext.Provider value={contextValue}>
      {children}
    </PuzzleCameraContext.Provider>
  );
}

export function usePuzzleCameraContext() {
  const ctx = useContext(PuzzleCameraContext);
  if (!ctx) throw new Error("usePuzzleCameraContext must be used within PuzzleCameraProvider");
  return ctx;
}
