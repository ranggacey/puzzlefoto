"use client";

import { useEffect, useState, useCallback } from "react";
import { useCamera } from "@/features/photo-booth/hooks/use-camera";
import { useCameraDevices } from "@/features/photo-booth/hooks/use-camera-devices";
import { useCountdown } from "@/features/photo-booth/hooks/use-countdown";
import { useCaptureStore } from "@/store/camera-store";
import { captureService } from "@/features/photo-booth/services/capture.service";
import { COUNTDOWN_OPTIONS } from "@/features/photo-booth/constants/camera";

import { PermissionScreen } from "@/features/photo-booth/components/permission-screen";
import { CameraPreview } from "@/features/photo-booth/components/camera-preview";
import { CameraControls } from "@/features/photo-booth/components/camera-controls";
import { CountdownOverlay } from "@/features/photo-booth/components/countdown-overlay";
import { FlashOverlay } from "@/features/photo-booth/components/flash-overlay";
import { ResultPreview } from "@/features/photo-booth/components/result-preview";

export default function PhotoBoothPage() {
  const {
    startCamera,
    toggleFacingMode,
    permissionStatus,
    activeStream,
    facingMode,
  } = useCamera();

  const { devices } = useCameraDevices();
  const hasMultipleCameras = devices.length > 1;

  const { capturedImage, setCapturedImage, isCapturing, setCapturing } = useCaptureStore();
  
  const [flashActive, setFlashActive] = useState(false);

  // Auto-request permission on mount if we haven't asked yet
  useEffect(() => {
    if (permissionStatus === "prompt") {
      startCamera();
    }
  }, [permissionStatus, startCamera]);

  const handleCaptureAction = useCallback(async () => {
    const videoElement = document.querySelector("video");
    if (!videoElement) return;

    setFlashActive(true);
    // Short delay to let flash render
    await new Promise((res) => setTimeout(res, 50));

    try {
      const dataUrl = await captureService.captureFrame(videoElement, {
        format: "dataUrl",
        mirror: facingMode === "user",
      });
      
      if (typeof dataUrl === "string") {
        setCapturedImage(dataUrl);
      }
    } catch (err) {
      console.error("Capture failed", err);
    } finally {
      setCapturing(false);
      setTimeout(() => setFlashActive(false), 500); // Wait for flash fade out
    }
  }, [facingMode, setCapturedImage, setCapturing]);

  const {
    activeCountdown,
    setActiveCountdown,
    currentValue: countdownValue,
    startCountdown,
  } = useCountdown(handleCaptureAction);

  const toggleCountdown = () => {
    const currentIndex = COUNTDOWN_OPTIONS.indexOf(activeCountdown);
    const nextIndex = (currentIndex + 1) % COUNTDOWN_OPTIONS.length;
    setActiveCountdown(COUNTDOWN_OPTIONS[nextIndex]);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleContinue = () => {
    // Future Sprint: Navigate to Puzzle Generation or Background Removal
    alert("Continuing to next step (Future Sprint)");
  };

  // 1. Permission Gate
  if (permissionStatus === "denied") {
    return <PermissionScreen onGrantPermission={startCamera} isDenied />;
  }

  if (permissionStatus === "prompt") {
    // Loading/Prompt state - keep background dark
    return <div className="absolute inset-0 bg-background" />;
  }

  // 2. Result Preview
  if (capturedImage) {
    return (
      <ResultPreview 
        imageUrl={capturedImage} 
        onRetake={handleRetake} 
        onContinue={handleContinue} 
      />
    );
  }

  // 3. Live Preview & Controls
  return (
    <main className="relative h-screen w-full overflow-hidden bg-black">
      <CameraPreview stream={activeStream} facingMode={facingMode} />
      
      <FlashOverlay isActive={flashActive} />
      
      <CountdownOverlay value={countdownValue} />
      
      <CameraControls
        onCapture={startCountdown}
        onSwitchCamera={toggleFacingMode}
        hasMultipleCameras={hasMultipleCameras}
        activeCountdown={activeCountdown}
        onToggleCountdown={toggleCountdown}
        isCapturing={isCapturing}
      />
    </main>
  );
}
