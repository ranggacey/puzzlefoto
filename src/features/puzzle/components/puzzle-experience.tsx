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
import { PuzzleDifficulty } from "../constants/puzzle-difficulty";
import { segmentationService } from "@/features/background-studio/services/segmentation.service";
import { compositorService } from "@/features/background-studio/services/compositor.service";

export function PuzzleExperience() {
  const { scene, sourceImage, pieces, difficulty, setScene, setSourceImage, setDifficulty, generatePuzzle, reset } = usePuzzleStore();
  const camera = usePuzzleCameraContext();

  const handleCapture = async () => {
    setScene("capturing");
    const photoDataUrl = await camera.capture();
    
    if (photoDataUrl) {
      // Process image to a transparent PNG using Background Studio services
      const img = new Image();
      img.src = photoDataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      await segmentationService.initialize();
      const mask = await segmentationService.segment(img);
      const transparentDataUrl = compositorService.composeToDataUrl(img, mask, { type: "transparent" });

      const newSourceImage = {
        id: crypto.randomUUID(),
        image: transparentDataUrl,
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
      </PuzzleStage>
    </FullscreenLayout>
  );
}
