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

export function PuzzleExperience() {
  const { scene, sourceImage, pieces, difficulty, setScene, setSourceImage, setDifficulty, generatePuzzle, reset } = usePuzzleStore();
  const camera = usePuzzleCameraContext();

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

        {scene === "completed" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="rounded-3xl bg-black/80 p-8 text-center border border-white/20 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-2">Puzzle Completed</h2>
              <p className="text-white/70">Victory experience will be implemented in Sprint 5.4.</p>
              <button 
                onClick={reset}
                className="mt-6 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </PuzzleStage>
    </FullscreenLayout>
  );
}
