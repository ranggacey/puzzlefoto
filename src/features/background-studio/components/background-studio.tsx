import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronLeft, ChevronRight } from "lucide-react";

import { useBackground } from "../hooks/use-background";
import { useBackgroundStore } from "@/store/background-store";
import { useCaptureStore } from "@/store/camera-store";

import { BackgroundToolbar } from "./background-toolbar";
import { BackgroundComparison } from "./background-comparison";
import { ProcessingOverlay } from "./processing-overlay";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { FullscreenLayout } from "@/components/layout/fullscreen-layout";

export function BackgroundStudio() {
  const router = useRouter();
  const { setProcessedPhotos } = useBackgroundStore();
  const { capturedPhotos } = useCaptureStore();
  
  const {
    backgroundConfig,
    setBackgroundConfig,
    processingStatus,
    processingProgress,
    initializeAndProcess,
    activePhotoIndex,
    setActivePhotoIndex,
    getActivePhoto,
    getActiveMask,
    finalizePhotos,
  } = useBackground();

  // Kickoff processing
  useEffect(() => {
    if (capturedPhotos.length === 0) {
      router.replace("/photo-booth");
      return;
    }
    initializeAndProcess();
  }, [capturedPhotos, initializeAndProcess, router]);

  const handleContinue = async () => {
    const finalized = await finalizePhotos();
    setProcessedPhotos(finalized);
    router.push("/puzzle");
  };

  const handleBack = () => {
    router.push("/photo-booth");
  };

  const photo = getActivePhoto();
  const mask = getActiveMask();

  const handlePrev = () => {
    setActivePhotoIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setActivePhotoIndex((prev) => Math.min(capturedPhotos.length - 1, prev + 1));
  };

  return (
    <FullscreenLayout
      headerLeft={
        <Button 
          variant="secondary" 
          size="icon" 
          className="rounded-full shadow-lg"
          onClick={handleBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      }
      headerRight={
        <>
          <ThemeToggle />
          <Button 
            className="rounded-full px-6 font-bold shadow-lg"
            onClick={handleContinue}
            disabled={processingStatus !== "DONE"}
          >
            Continue
            <Check className="ml-2 h-4 w-4" />
          </Button>
        </>
      }
    >
      <ProcessingOverlay status={processingStatus} progress={processingProgress} />
      
      {/* Main Content Area */}
      <main className="flex h-full w-full flex-col overflow-hidden pb-[140px] pt-[100px] px-6">
        <div className="relative flex flex-1 items-center justify-center">
          {photo && (
            <BackgroundComparison 
              photo={photo} 
              mask={mask} 
              config={backgroundConfig} 
            />
          )}

          {/* Photo Navigation Overlay */}
          {capturedPhotos.length > 1 && (
            <>
              {activePhotoIndex > 0 && (
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute left-2 z-30 rounded-full shadow-lg"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}
              {activePhotoIndex < capturedPhotos.length - 1 && (
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute right-2 z-30 rounded-full shadow-lg"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}
            </>
          )}
        </div>
        
        {/* Film Strip Indicators */}
        {capturedPhotos.length > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {capturedPhotos.map((_, i) => (
              <div 
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === activePhotoIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        )}
      </main>

      {/* Toolbar Area */}
      <div className="absolute bottom-0 left-0 right-0 z-40">
        <BackgroundToolbar 
          config={backgroundConfig} 
          onChange={setBackgroundConfig} 
        />
      </div>
    </FullscreenLayout>
  );
}
