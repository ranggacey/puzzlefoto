import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ArrowLeft } from "lucide-react";
import { useCamera } from "@/features/photo-booth/hooks/use-camera";
import { useCameraDevices } from "@/features/photo-booth/hooks/use-camera-devices";
import { useCountdown } from "@/features/photo-booth/hooks/use-countdown";
import { captureService } from "@/features/photo-booth/services/capture.service";
import { COUNTDOWN_OPTIONS, CountdownOption } from "@/features/photo-booth/constants/camera";
import type { CaptureModeConfig, CapturedPhoto } from "@/types";

import { PermissionScreen } from "@/features/photo-booth/components/permission-screen";
import { CameraPreview } from "@/features/photo-booth/components/camera-preview";
import { CameraControls } from "@/features/photo-booth/components/camera-controls";
import { CountdownOverlay } from "@/features/photo-booth/components/countdown-overlay";
import { FlashOverlay } from "@/features/photo-booth/components/flash-overlay";
import { CaptureProgress } from "@/features/photo-booth/components/capture-progress";

interface PhotoStageProps {
  config: CaptureModeConfig;
  onPhotoCaptured: (photo: CapturedPhoto) => void;
  currentPhotoCount: number;
  onBack: () => void;
}

export function PhotoStage({ config, onPhotoCaptured, currentPhotoCount, onBack }: PhotoStageProps) {
  const {
    startCamera,
    stopCamera, // Ensure this is available from useCamera
    toggleFacingMode,
    permissionStatus,
    activeStream,
    facingMode,
  } = useCamera();

  const { devices } = useCameraDevices();
  const hasMultipleCameras = devices.length > 1;

  const [flashActive, setFlashActive] = useState(false);
  const [isCapturingFrame, setIsCapturingFrame] = useState(false);
  const [latestThumbnail, setLatestThumbnail] = useState<string | null>(null);

  // Auto-request permission on mount if needed
  useEffect(() => {
    if (permissionStatus === "prompt") {
      startCamera();
    }
  }, [permissionStatus, startCamera]);

  const handleCaptureAction = useCallback(async () => {
    const videoElement = document.querySelector("video");
    if (!videoElement) return;

    setIsCapturingFrame(true);
    setFlashActive(true);
    
    // Short delay to let flash render
    await new Promise((res) => setTimeout(res, 50));

    try {
      const dataUrl = await captureService.captureFrame(videoElement, {
        format: "dataUrl",
        mirror: config.allowMirror && facingMode === "user",
      });
      
      if (typeof dataUrl === "string") {
        const photo: CapturedPhoto = {
          id: uuidv4(),
          image: dataUrl,
          timestamp: Date.now(),
          width: videoElement.videoWidth,
          height: videoElement.videoHeight,
        };
        
        onPhotoCaptured(photo);
        
        // Show thumbnail animation if multi-capture
        if (config.requiredPhotos > 1) {
          setLatestThumbnail(dataUrl);
          // Hide thumbnail after animation completes so it doesn't block UI forever
          setTimeout(() => setLatestThumbnail(null), 1500); 
        }
      }
    } catch (err) {
      console.error("Capture failed", err);
    } finally {
      setIsCapturingFrame(false);
      setTimeout(() => setFlashActive(false), 500);
    }
  }, [facingMode, config, onPhotoCaptured]);

  const {
    activeCountdown,
    setActiveCountdown,
    currentValue: countdownValue,
    startCountdown,
  } = useCountdown(handleCaptureAction);

  // For multi-capture, automatically start the next countdown after a brief pause
  useEffect(() => {
    if (
      config.requiredPhotos > 1 && 
      currentPhotoCount > 0 && 
      currentPhotoCount < config.requiredPhotos && 
      !flashActive && 
      !isCapturingFrame && 
      countdownValue === null
    ) {
      // Small delay before starting next capture
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

  if (permissionStatus === "denied") {
    return <PermissionScreen onGrantPermission={startCamera} isDenied />;
  }

  if (permissionStatus === "prompt") {
    return <div className="absolute inset-0 bg-background" />;
  }

  const handleBackClick = () => {
    stopCamera();
    onBack();
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      
      {/* Back Button */}
      <button 
        onClick={handleBackClick}
        className="absolute left-6 top-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-background/50 text-foreground backdrop-blur-md transition-colors hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Back to Mode Selection"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <CameraPreview stream={activeStream} facingMode={facingMode} />
      
      <FlashOverlay isActive={flashActive} />
      
      <CountdownOverlay value={countdownValue} />
      
      <CaptureProgress 
        requiredPhotos={config.requiredPhotos}
        currentCount={currentPhotoCount}
        latestThumbnail={latestThumbnail}
      />
      
      <CameraControls
        onCapture={startCountdown}
        onSwitchCamera={toggleFacingMode}
        hasMultipleCameras={hasMultipleCameras}
        activeCountdown={activeCountdown}
        onToggleCountdown={toggleCountdown}
        isCapturing={isCapturingFrame || countdownValue !== null}
      />
    </div>
  );
}
