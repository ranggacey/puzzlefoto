import { useEffect, useCallback, useRef } from "react";
import { useCameraStore } from "@/store/camera-store";
import { cameraService } from "../services/camera.service";
import { FacingMode } from "../types/camera";

export function useCamera() {
  const store = useCameraStore();
  const startAttemptRef = useRef(0);
  
  // Track previous constraints to detect changes safely
  const prevConstraintsRef = useRef({ deviceId: store.deviceId, facingMode: store.facingMode });

  const startCamera = useCallback(async () => {
    const attempt = ++startAttemptRef.current;
    
    store.setStreamState("loading");
    store.setError(null);
    
    try {
      const stream = await cameraService.startStream(store.deviceId, store.facingMode);
      
      // If we made a newer attempt while waiting, discard this one
      if (attempt !== startAttemptRef.current) return;

      store.setActiveStream(stream);
      store.setActive(true);
      store.setPermissionStatus("granted");
      store.setStreamState("success");
    } catch (err: unknown) {
      if (attempt !== startAttemptRef.current) return;
      
      store.setStreamState("error");
      if (err instanceof Error) {
        if (err.message.includes("aborted")) return;
        
        store.setError(err.message || "Failed to start camera");
        if (err.name === "NotAllowedError") {
          store.setPermissionStatus("denied");
        }
      } else {
        store.setError("Failed to start camera");
      }
    }
  }, [store.deviceId, store.facingMode, store.setActiveStream, store.setActive, store.setPermissionStatus, store.setStreamState, store.setError]);

  const stopCamera = useCallback(() => {
    startAttemptRef.current++; // Invalidate any pending starts
    cameraService.cleanup();
    store.setActiveStream(null);
    store.setActive(false);
    store.setStreamState("idle");
  }, [store.setActiveStream, store.setActive, store.setStreamState]);

  const toggleFacingMode = useCallback(() => {
    const newMode: FacingMode = store.facingMode === "user" ? "environment" : "user";
    store.setFacingMode(newMode);
    store.setDeviceId(null); 
  }, [store.facingMode, store.setFacingMode, store.setDeviceId]);

  // Restart camera when constraints change, IF it's already active
  useEffect(() => {
    const constraintsChanged = 
      prevConstraintsRef.current.deviceId !== store.deviceId || 
      prevConstraintsRef.current.facingMode !== store.facingMode;
      
    if (store.isActive && constraintsChanged) {
      startCamera();
    }
    
    prevConstraintsRef.current = { deviceId: store.deviceId, facingMode: store.facingMode };
  }, [store.deviceId, store.facingMode, store.isActive, startCamera]);

  // Full cleanup on hook unmount
  useEffect(() => {
    return () => {
      startAttemptRef.current++;
      cameraService.cleanup();
      // We don't call Zustand setters on unmount to avoid React warnings about updates during unmount,
      // but if we do, it's fine. We need to reset the active state.
      store.setActiveStream(null);
      store.setActive(false);
    };
  }, [store.setActiveStream, store.setActive]);

  return {
    isActive: store.isActive,
    activeStream: store.activeStream,
    facingMode: store.facingMode,
    deviceId: store.deviceId,
    permissionStatus: store.permissionStatus,
    streamState: store.streamState,
    error: store.error,
    startCamera,
    stopCamera,
    toggleFacingMode,
    setDeviceId: store.setDeviceId,
  };
}
