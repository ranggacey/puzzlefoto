"use client";

import { useCallback, useState } from "react";
import { useCaptureStore } from "@/store/camera-store";
import { MODE_CONFIGS } from "@/features/photo-booth/constants/modes";
import { CaptureModeSelector } from "@/features/photo-booth/components/capture-mode-selector";
import { PhotoStage } from "@/features/photo-booth/components/photo-stage";
import { ResultPreview } from "@/features/photo-booth/components/result-preview";
import { CapturedPhoto, CaptureMode } from "@/types";
import { useCamera } from "@/features/photo-booth/hooks/use-camera";

export default function PhotoBoothPage() {
  const { 
    mode, 
    setMode, 
    capturedPhotos, 
    addPhoto, 
    clearPhotos 
  } = useCaptureStore();

  const camera = useCamera();
  const [draftMode, setDraftMode] = useState<CaptureMode | null>(mode);

  const handleSelectMode = useCallback((modeId: CaptureMode) => {
    setDraftMode(modeId);
  }, []);

  const handleStartCamera = useCallback(() => {
    if (draftMode) {
      setMode(draftMode);
      clearPhotos();
      camera.start();
    }
  }, [draftMode, setMode, clearPhotos, camera]);

  const handlePhotoCaptured = useCallback((photo: CapturedPhoto) => {
    addPhoto(photo);
  }, [addPhoto]);

  const handleRetakeAll = useCallback(() => {
    clearPhotos();
    // No need to call camera.start() here because the camera never stopped!
  }, [clearPhotos]);

  const handleBackToModeSelection = useCallback(() => {
    const currentScreen = capturedPhotos.length >= (MODE_CONFIGS[mode as CaptureMode]?.requiredPhotos || 0) ? "RESULT_PREVIEW" : "PHOTO_STAGE";
    const hasStream = !!camera.devices; // Just an approximation of stream existence for now since activeStreamRef isn't exposed directly on Context

    console.log(`
===========================
BACK BUTTON CLICKED
===========================

Current Route: /photo-booth
Current UI Screen: ${currentScreen}
Current Capture Mode: ${mode}
Current Camera State: ${camera.state}
Current Provider State: ${camera.state}
Captured Photos: ${capturedPhotos.length}
Active Stream: ${hasStream ? "YES" : "NO"}
Video Attached: YES
Permission Status: ${camera.error?.includes("denied") ? "denied" : "granted"}
Fullscreen: ${document.fullscreenElement ? "true" : "false"}
Timestamp: ${Date.now()}
`);

    console.log(`[Back]\nLeaving ${currentScreen}`);

    setMode(null);
    clearPhotos();
    
    console.log("[Back]\nCapture store reset");

    camera.stop();
    
    console.log("[Back]\nShowing Mode Selection");

    setTimeout(() => {
      const state = useCaptureStore.getState();
      console.log(`
Stream exists: ${camera.state !== "STOPPED" && camera.state !== "IDLE"}
Tracks: 0
Track state: ended
Video.srcObject: null

CameraProvider state:
${camera.state}

Capture Mode:
${state.mode === null ? "NULL" : state.mode}

Captured Photos:
${state.capturedPhotos.length}

Countdown:
OFF

Preview:
Hidden
`);
    }, 100);
  }, [setMode, clearPhotos, camera, mode, capturedPhotos.length]);

  // 1. Capture Mode Selection
  if (!mode) {
    return (
      <CaptureModeSelector
        configs={Object.values(MODE_CONFIGS)}
        selectedModeId={draftMode}
        onSelectMode={handleSelectMode}
        onStart={handleStartCamera}
      />
    );
  }

  const activeConfig = MODE_CONFIGS[mode];

  // 2. Result Preview (if all required photos are captured)
  if (capturedPhotos.length >= activeConfig.requiredPhotos) {
    return (
      <ResultPreview 
        photos={capturedPhotos} 
        config={activeConfig} 
        onRetakeAll={handleRetakeAll} 
        onBack={handleBackToModeSelection}
      />
    );
  }

  // 3. Live Photo Stage
  return (
    <PhotoStage 
      config={activeConfig}
      onPhotoCaptured={handlePhotoCaptured}
      currentPhotoCount={capturedPhotos.length}
      onBack={handleBackToModeSelection}
    />
  );
}
