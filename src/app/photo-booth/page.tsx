"use client";

import { useCallback } from "react";
import { useCaptureStore } from "@/store/camera-store";
import { MODE_CONFIGS } from "@/features/photo-booth/constants/modes";
import { CaptureModeSelector } from "@/features/photo-booth/components/capture-mode-selector";
import { PhotoStage } from "@/features/photo-booth/components/photo-stage";
import { ResultPreview } from "@/features/photo-booth/components/result-preview";
import { CapturedPhoto, CaptureMode } from "@/types";

export default function PhotoBoothPage() {
  const { 
    mode, 
    setMode, 
    capturedPhotos, 
    addPhoto, 
    clearPhotos 
  } = useCaptureStore();

  const handleSelectMode = useCallback((modeId: CaptureMode) => {
    setMode(modeId);
    clearPhotos();
  }, [setMode, clearPhotos]);

  const handlePhotoCaptured = useCallback((photo: CapturedPhoto) => {
    addPhoto(photo);
  }, [addPhoto]);

  const handleRetakeAll = useCallback(() => {
    clearPhotos();
  }, [clearPhotos]);

  // 1. Capture Mode Selection
  if (!mode) {
    return (
      <CaptureModeSelector
        configs={Object.values(MODE_CONFIGS)}
        selectedModeId={mode}
        onSelectMode={handleSelectMode}
        onStart={() => {
          // Mode is already selected, UI will naturally progress because 
          // we require `mode` to be set. The "Start Camera" button in the selector
          // just ensures they have clicked something, but since we set it instantly
          // we don't strictly need `onStart` to do anything other than trigger 
          // a visual transition if we wanted one.
        }}
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
        onBack={() => {
          // If we want to return to the camera while keeping photos (unlikely), we wouldn't clear photos.
          // In this case, "Back" from preview means they changed their mind about the layout or want to start over.
          setMode(null);
          clearPhotos();
        }}
      />
    );
  }

  // 3. Live Photo Stage
  return (
    <PhotoStage 
      config={activeConfig}
      onPhotoCaptured={handlePhotoCaptured}
      currentPhotoCount={capturedPhotos.length}
      onBack={() => setMode(null)}
    />
  );
}
