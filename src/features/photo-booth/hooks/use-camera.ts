import { useEffect, useCallback } from "react";
import { useCameraStore } from "@/store/camera-store";
import { cameraService } from "../services/camera.service";
import { FacingMode } from "../types/camera";

export function useCamera() {
  const {
    isActive,
    facingMode,
    deviceId,
    activeStream,
    permissionStatus,
    streamState,
    error,
    setActive,
    setFacingMode,
    setDeviceId,
    setActiveStream,
    setPermissionStatus,
    setStreamState,
    setError,
  } = useCameraStore();

  const startCamera = useCallback(async () => {
    setStreamState("loading");
    setError(null);
    try {
      const stream = await cameraService.startStream(deviceId, facingMode);
      setActiveStream(stream);
      setActive(true);
      setPermissionStatus("granted");
      setStreamState("success");
    } catch (err: unknown) {
      setStreamState("error");
      if (err instanceof Error) {
        setError(err.message || "Failed to start camera");
        if (err.name === "NotAllowedError") {
          setPermissionStatus("denied");
        }
      } else {
        setError("Failed to start camera");
      }
    }
  }, [deviceId, facingMode, setActiveStream, setActive, setPermissionStatus, setStreamState, setError]);

  const stopCamera = useCallback(() => {
    cameraService.stopStream();
    setActiveStream(null);
    setActive(false);
    setStreamState("idle");
  }, [setActiveStream, setActive, setStreamState]);

  const toggleFacingMode = useCallback(() => {
    const newMode: FacingMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    // Remove explicit deviceId if switching mode, otherwise it might conflict
    setDeviceId(null); 
  }, [facingMode, setFacingMode, setDeviceId]);

  // Handle stream lifecycle: restart stream if constraints change and camera is active
  useEffect(() => {
    if (isActive) {
      startCamera();
    }
    return () => {
      // Intentionally not stopping the stream on every constraint change unmount here 
      // to avoid flickers, but we rely on startCamera calling cleanup internally.
    };
  }, [deviceId, facingMode, isActive, startCamera]);

  // Full cleanup on hook unmount
  useEffect(() => {
    return () => {
      cameraService.cleanup();
      setActiveStream(null);
      setActive(false);
    };
  }, [setActiveStream, setActive]);

  return {
    isActive,
    activeStream,
    facingMode,
    deviceId,
    permissionStatus,
    streamState,
    error,
    startCamera,
    stopCamera,
    toggleFacingMode,
    setDeviceId,
  };
}
