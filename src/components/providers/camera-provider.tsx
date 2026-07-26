"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { CameraDevice, CameraState, FacingMode, CameraContextType } from "@/features/photo-booth/types/camera";
import { cameraService } from "@/features/photo-booth/services/camera.service";
import { captureService } from "@/features/photo-booth/services/capture.service";

const CameraContext = createContext<CameraContextType | null>(null);

export function CameraProvider({ children }: { children: React.ReactNode }) {
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

  const start = useCallback(async () => {
    const attempt = ++startAttemptRef.current;
    
    setState("STARTING");
    setError(null);
    
    try {
      // If we already have a stream, stop it first to ensure a clean start
      if (activeStreamRef.current) {
        cameraService.stopStream(activeStreamRef.current);
        activeStreamRef.current = null;
      }

      const stream = await cameraService.openStream(deviceId, facingMode);
      
      // If we made a newer attempt while waiting, discard this one
      if (attempt !== startAttemptRef.current) {
        cameraService.stopStream(stream);
        return;
      }

      activeStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.warn("Video play interrupted:", e));
        }
      }

      setState("READY");
    } catch (err: unknown) {
      if (attempt !== startAttemptRef.current) return;
      
      if (err instanceof Error) {
        if (err.message.includes("aborted")) return; // Safe ignore
        
        setError(err.message || "Failed to start camera");
        if (err.name === "NotAllowedError") {
          setState("ERROR");
        } else {
          setState("ERROR");
        }
      } else {
        setError("Failed to start camera");
        setState("ERROR");
      }
    }
  }, [deviceId, facingMode]);

  const stop = useCallback(() => {
    startAttemptRef.current++; // Invalidate any pending starts
    setState("STOPPING");
    
    if (activeStreamRef.current) {
      cameraService.stopStream(activeStreamRef.current);
      activeStreamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState("STOPPED");
  }, []);

  const restart = useCallback(async () => {
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
    setState("CAPTURING");
    
    try {
      const dataUrl = await captureService.captureFrame(videoRef.current, {
        format: "dataUrl",
        mirror: facingMode === "user",
      });
      setState(prevState);
      return typeof dataUrl === "string" ? dataUrl : null;
    } catch (err) {
      console.error("Capture failed:", err);
      setState(prevState);
      return null;
    }
  }, [facingMode, state]);

  const attachVideo = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    
    if (element && activeStreamRef.current) {
      if (element.srcObject !== activeStreamRef.current) {
        element.srcObject = activeStreamRef.current;
        const playPromise = element.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.warn("Video play interrupted:", e));
        }
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
    <CameraContext.Provider value={{
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
    </CameraContext.Provider>
  );
}

export function useCameraContext() {
  const ctx = useContext(CameraContext);
  if (!ctx) throw new Error("useCameraContext must be used within CameraProvider");
  return ctx;
}
