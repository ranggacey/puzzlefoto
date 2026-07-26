import { useEffect, useCallback } from "react";
import { useCameraStore } from "@/store/camera-store";
import { cameraService } from "../services/camera.service";

export function useCameraDevices() {
  const { devices, setDevices } = useCameraStore();

  const loadDevices = useCallback(async () => {
    try {
      const availableDevices = await cameraService.enumerateDevices();
      setDevices(availableDevices);
    } catch (error) {
      console.warn("Failed to enumerate devices:", error);
    }
  }, [setDevices]);

  useEffect(() => {
    // Initial load
    loadDevices();

    // Listen for device changes (e.g. plugging in a webcam)
    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener("devicechange", loadDevices);
      return () => {
        navigator.mediaDevices.removeEventListener("devicechange", loadDevices);
      };
    }
  }, [loadDevices]);

  return { devices, refreshDevices: loadDevices };
}
