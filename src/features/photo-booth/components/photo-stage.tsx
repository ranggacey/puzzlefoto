import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ArrowLeft } from "lucide-react";
import { usePhotoBoothCamera } from "@/features/photo-booth/hooks/use-photo-booth-camera";
import { useCountdown } from "@/features/photo-booth/hooks/use-countdown";
import { COUNTDOWN_OPTIONS, CountdownOption } from "@/features/photo-booth/constants/camera";
import type { CaptureModeConfig, CapturedPhoto } from "@/types";

import { PermissionScreen } from "@/features/photo-booth/components/permission-screen";
import { CameraPreview } from "@/features/photo-booth/components/camera-preview";
import { CameraControls } from "@/features/photo-booth/components/camera-controls";
import { CountdownOverlay } from "@/features/photo-booth/components/countdown-overlay";
import { FlashOverlay } from "@/features/photo-booth/components/flash-overlay";
import { CaptureProgress } from "@/features/photo-booth/components/capture-progress";
import { FullscreenLayout } from "@/components/layout/fullscreen-layout";

interface PhotoStageProps {
  config: CaptureModeConfig;
  onPhotoCaptured: (photo: CapturedPhoto) => void;
  currentPhotoCount: number;
  onBack: () => void;
}

export function PhotoStage({ config, onPhotoCaptured, currentPhotoCount, onBack }: PhotoStageProps) {
  const camera = usePhotoBoothCamera();

  const [flashActive, setFlashActive] = useState(false);
  const [isCapturingFrame, setIsCapturingFrame] = useState(false);
  const [latestThumbnail, setLatestThumbnail] = useState<string | null>(null);

  const handleCaptureAction = useCallback(async () => {
    setIsCapturingFrame(true);
    setFlashActive(true);
    
    // Short delay to let flash render
    await new Promise((res) => setTimeout(res, 50));

    try {
      const dataUrl = await camera.capture();
      
      if (dataUrl) {
        // We need dimensions. Wait, capture() gives us a dataUrl.
        // We can create an image to get dimensions, or hardcode for now, or have capture() return them.
        // Let's create an image to get intrinsic dimensions quickly.
        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const photo: CapturedPhoto = {
          id: uuidv4(),
          image: dataUrl,
          timestamp: Date.now(),
          width: img.width,
          height: img.height,
        };
        
        onPhotoCaptured(photo);
        
        if (config.requiredPhotos > 1) {
          setLatestThumbnail(dataUrl);
          setTimeout(() => setLatestThumbnail(null), 1500); 
        }
      }
    } catch (err) {
      console.error("Capture failed", err);
    } finally {
      setIsCapturingFrame(false);
      setTimeout(() => setFlashActive(false), 500);
    }
  }, [camera, config, onPhotoCaptured]);

  const {
    activeCountdown,
    setActiveCountdown,
    currentValue: countdownValue,
    startCountdown,
  } = useCountdown(handleCaptureAction);

  useEffect(() => {
    if (
      config.requiredPhotos > 1 && 
      currentPhotoCount > 0 && 
      currentPhotoCount < config.requiredPhotos && 
      !flashActive && 
      !isCapturingFrame && 
      countdownValue === null
    ) {
      const timer = setTimeout(() => {
        startCountdown();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentPhotoCount, config.requiredPhotos, flashActive, isCapturingFrame, countdownValue, startCountdown]);

  const toggleCountdown = () => {
    const currentIndex = COUNTDOWN_OPTIONS.indexOf(activeCountdown as CountdownOption);
    const nextIndex = (currentIndex + 1) % COUNTDOWN_OPTIONS.length;
    setActiveCountdown(COUNTDOWN_OPTIONS[nextIndex]);
  };

  if (camera.state === "ERROR" || camera.state === "REQUESTING_PERMISSION") {
    // If we had a specific permission status we could render PermissionScreen. 
    // If it's an error, we show error.
    if (camera.error?.includes("denied")) {
      return <PermissionScreen onGrantPermission={camera.start} isDenied />;
    }
    // Just a fallback
  }

  if (camera.state === "IDLE") {
    return <div className="absolute inset-0 bg-background" />;
  }

  return (
    <FullscreenLayout
      className="bg-black"
      headerLeft={
        <button 
          onClick={onBack}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-background/50 text-foreground backdrop-blur-md transition-colors hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Back to Mode Selection"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      }
    >
      {/* Note: CameraPreview now takes no stream, it just gets it via attachVideo */}
      <CameraPreview facingMode={camera.facingMode} />
      
      {camera.state === "STARTING" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary"></div>
        </div>
      )}
      
      <FlashOverlay isActive={flashActive} />
      
      <CountdownOverlay value={countdownValue} />
      
      <CaptureProgress 
        requiredPhotos={config.requiredPhotos}
        currentCount={currentPhotoCount}
        latestThumbnail={latestThumbnail}
      />
      
      <CameraControls
        onCapture={startCountdown}
        onSwitchCamera={camera.switchCamera}
        hasMultipleCameras={camera.devices.length > 1}
        activeCountdown={activeCountdown}
        onToggleCountdown={toggleCountdown}
        isCapturing={isCapturingFrame || countdownValue !== null}
      />
    </FullscreenLayout>
  );
}
