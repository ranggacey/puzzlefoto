"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { CameraDevice, CameraState, FacingMode, CameraContextType } from "@/features/photo-booth/types/camera";
import { cameraService } from "@/services/camera.service";
import { captureService } from "@/services/capture.service";

import { cameraDebug, cameraWarn, startCameraTimer, endCameraTimer } from "@/features/photo-booth/utils/camera-debug";

const PhotoBoothCameraContext = createContext<CameraContextType | null>(null);

export function PhotoBoothCameraProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CameraState>("IDLE");
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const startAttemptRef = useRef(0);

  // Initialize devices list once
  useEffect(() => {
    let mounted = true;
    async function loadDevices() {
      try {
        const devs = await cameraService.enumerateDevices();
        if (mounted) setDevices(devs);
      } catch (err) {
        console.warn("Could not enumerate devices:", err);
      }
    }
    // Only enumerate after permission is likely granted or if browser allows it upfront
    loadDevices();
    return () => { mounted = false; };
  }, []);

  // Helper to log state transitions
  const setCameraState = useCallback((newState: CameraState) => {
    setState((prevState) => {
      if (prevState !== newState) {
        cameraDebug(`[Camera] state:\n${prevState} -> ${newState}`);
      }
      return newState;
    });
  }, []);

  const start = useCallback(async () => {
    cameraDebug("[Camera] start() called");
    const attempt = ++startAttemptRef.current;
    
    setCameraState("STARTING");
    setError(null);
    
    try {
      // If we already have a stream, stop it first to ensure a clean start
      if (activeStreamRef.current) {
        cameraDebug("[Camera] clearing existing stream before start");
        cameraService.stopStream(activeStreamRef.current);
        activeStreamRef.current = null;
      }

      startCameraTimer("startToReady");
      const stream = await cameraService.openStream(deviceId, facingMode);
      
      // If we made a newer attempt while waiting, discard this one
      if (attempt !== startAttemptRef.current) {
        cameraWarn("[Camera] discarding stream due to newer start attempt");
        cameraService.stopStream(stream);
        return;
      }

      cameraDebug("[Camera] stream stored");
      activeStreamRef.current = stream;

      if (videoRef.current) {
        cameraDebug("[Camera] srcObject assigned immediately inside start()");
        videoRef.current.srcObject = stream;
        startCameraTimer("videoPlay");
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => cameraWarn("[Camera] Video play interrupted:", e));
        }
      } else {
        cameraWarn("[Camera] videoRef is null when stream resolves!");
      }

      setCameraState("READY");
      endCameraTimer("startToReady");
    } catch (err: unknown) {
      if (attempt !== startAttemptRef.current) return;
      
      if (err instanceof Error) {
        if (err.message.includes("aborted")) return; // Safe ignore
        
        setError(err.message || "Failed to start camera");
        if (err.name === "NotAllowedError") {
          setCameraState("ERROR");
        } else {
          setCameraState("ERROR");
        }
      } else {
        setError("Failed to start camera");
        setCameraState("ERROR");
      }
    }
  }, [deviceId, facingMode, setCameraState]);

  const stop = useCallback(() => {
    cameraDebug("[Camera] stop() called");
    startAttemptRef.current++; // Invalidate any pending starts
    setCameraState("STOPPING");
    
    if (activeStreamRef.current) {
      cameraDebug("[Camera] stream cleared");
      cameraService.stopStream(activeStreamRef.current);
      activeStreamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState("STOPPED");
  }, [setCameraState]);

  const restart = useCallback(async () => {
    cameraDebug("[Camera] restart() called");
    stop();
    return start();
  }, [stop, start]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    setDeviceId(null); // Clear explicit device ID when switching
    // We don't auto-restart here. UI should call restart if needed, 
    // or we can auto-restart if state === READY
  }, []);

  // Auto-restart if we switch cameras while READY
  const prevFacingMode = useRef(facingMode);
  useEffect(() => {
    if (prevFacingMode.current !== facingMode && state === "READY") {
      restart();
    }
    prevFacingMode.current = facingMode;
  }, [facingMode, state, restart]);


  const capture = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current || state !== "READY") return null;
    
    const prevState = state;
    setCameraState("CAPTURING");
    
    try {
      const dataUrl = await captureService.captureFrame(videoRef.current, {
        format: "dataUrl",
        mirror: facingMode === "user",
      });
      setCameraState(prevState);
      return typeof dataUrl === "string" ? dataUrl : null;
    } catch (err) {
      console.error("Capture failed:", err);
      setCameraState(prevState);
      return null;
    }
  }, [facingMode, state, setCameraState]);

  const attachVideo = useCallback((element: HTMLVideoElement | null) => {
    cameraDebug(`[Camera] attachVideo() called with ${element ? 'element' : 'null'}`);
    videoRef.current = element;
    
    if (element && activeStreamRef.current) {
      if (element.srcObject !== activeStreamRef.current) {
        cameraDebug("[Camera] attachVideo() success: srcObject assigned");
        element.srcObject = activeStreamRef.current;
        startCameraTimer("videoPlay");
        const playPromise = element.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => cameraWarn("[Camera] Video play interrupted:", e));
        }
      } else {
        cameraDebug("[Camera] attachVideo(): srcObject already assigned");
      }
    } else {
      if (element && !activeStreamRef.current) {
        cameraDebug("[Camera] attachVideo() failed: activeStreamRef is null");
      }
    }
  }, []);

  // Cleanup on provider unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return (
    <PhotoBoothCameraContext.Provider value={{
      state,
      devices,
      deviceId,
      facingMode,
      error,
      start,
      stop,
      restart,
      capture,
      switchCamera,
      attachVideo
    }}>
      {children}
    </PhotoBoothCameraContext.Provider>
  );
}

export function usePhotoBoothCamera() {
  const ctx = useContext(PhotoBoothCameraContext);
  if (!ctx) throw new Error("usePhotoBoothCamera must be used within PhotoBoothCameraProvider");
  return ctx;
}
