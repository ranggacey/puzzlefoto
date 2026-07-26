import { FullscreenLayout } from "@/components/layout/fullscreen-layout";
import { usePuzzleStore } from "@/store/puzzle-store";
import { usePuzzleCameraContext } from "../providers/puzzle-camera-provider";
import { LiveBackground } from "./live-background";
import { PuzzleStage } from "./puzzle-stage";
import { CalibrationOverlay } from "./calibration-overlay";
import { CaptureOverlay } from "./capture-overlay";
import { FloatingPhoto } from "./floating-photo";

export function PuzzleExperience() {
  const { scene, sourceImage, setScene, setSourceImage } = usePuzzleStore();
  const camera = usePuzzleCameraContext();

  const handleCapture = async () => {
    setScene("capturing");
    const photoDataUrl = await camera.capture();
    
    if (photoDataUrl) {
      setSourceImage({
        id: crypto.randomUUID(),
        image: photoDataUrl,
        width: 1080,
        height: 1920,
        timestamp: Date.now()
      });
      setScene("freeze");
      
      // Scene Orchestration
      setTimeout(() => {
        setScene("floating");
        setTimeout(() => {
          setScene("calibration");
        }, 1200);
      }, 800);
    } else {
      setScene("camera"); // revert if capture failed
    }
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
      </PuzzleStage>
    </FullscreenLayout>
  );
}
