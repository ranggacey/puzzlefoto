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
    setMode(null);
    clearPhotos();
    camera.stop();
  }, [setMode, clearPhotos, camera]);

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
