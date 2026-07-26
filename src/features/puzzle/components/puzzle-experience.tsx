import React from "react";
import { FullscreenLayout } from "@/components/layout/fullscreen-layout";
import { usePuzzleStore } from "@/store/puzzle-store";
import { usePuzzleCameraContext } from "../providers/puzzle-camera-provider";
import { LiveBackground } from "./live-background";
import { PuzzleStage } from "./puzzle-stage";
import { CalibrationOverlay } from "./calibration-overlay";
import { CaptureOverlay } from "./capture-overlay";
import { FloatingPhoto } from "./floating-photo";
import { PuzzleBoard } from "./puzzle-board";
import { DifficultySelectionOverlay } from "./difficulty-selection-overlay";
import { PuzzleCompletedOverlay } from "./puzzle-completed-overlay";
import { PuzzleDifficulty } from "../constants/puzzle-difficulty";
import { HandTrackingProvider } from "@/features/hand-tracking/providers/hand-tracking-provider";
import { PointerOverlay } from "@/features/hand-tracking/components/pointer-overlay";
import { HandTrackingDebugOverlay } from "@/features/hand-tracking/components/debug-overlay";

export function PuzzleExperience() {
  const { scene, sourceImage, pieces, difficulty, isTimerRunning, startedAt, setScene, setSourceImage, setDifficulty, generatePuzzle, reset, setElapsedTime } = usePuzzleStore();
  const camera = usePuzzleCameraContext();

  // Timer Effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && startedAt) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startedAt) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, startedAt, setElapsedTime]);

  const handleCapture = async () => {
    setScene("capturing");
    const photoDataUrl = await camera.capture();
    
    if (photoDataUrl) {
      const newSourceImage = {
        id: crypto.randomUUID(),
        image: photoDataUrl,
        width: 1080,
        height: 1920,
        timestamp: Date.now()
      };
      setSourceImage(newSourceImage);
      setScene("freeze");
      
      // Scene Orchestration
      setTimeout(() => {
        setScene("floating");
        setTimeout(() => {
          setScene("calibration");
          // Simulate calibration finish to transition to difficulty selection
          setTimeout(() => {
            setScene("difficulty-selection");
          }, 3000);
        }, 1200);
      }, 800);
    } else {
      setScene("camera"); // revert if capture failed
    }
  };

  const handleContinue = (selectedDifficulty: PuzzleDifficulty) => {
    if (sourceImage) {
      setDifficulty(selectedDifficulty);
      generatePuzzle(sourceImage);
      setScene("gameplay");
    }
  };

  const handleRetake = () => {
    reset();
  };

  return (
    <FullscreenLayout>
      <HandTrackingProvider>
        <PuzzleStage>
          <LiveBackground />
        
        {(scene === "camera" || scene === "capturing") && (
          <CaptureOverlay onCapture={handleCapture} />
        )}

        {(scene === "freeze" || scene === "floating" || scene === "calibration") && sourceImage && (
          <FloatingPhoto />
        )}

        {scene === "calibration" && (
          <CalibrationOverlay />
        )}

        {scene === "difficulty-selection" && (
          <DifficultySelectionOverlay onContinue={handleContinue} onRetake={handleRetake} />
        )}

        {scene === "gameplay" && (
          <PuzzleBoard pieces={pieces} sourceImage={sourceImage} difficulty={difficulty} />
        )}

        <PointerOverlay />

        {scene === "completed" && (
          <PuzzleCompletedOverlay />
        )}
        <React.Suspense fallback={null}>
          <HandTrackingDebugOverlay />
        </React.Suspense>
        </PuzzleStage>
      </HandTrackingProvider>
    </FullscreenLayout>
  );
}
