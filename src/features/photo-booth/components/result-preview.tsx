import { motion } from "motion/react";
import { Check, RotateCcw, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FullscreenLayout } from "@/components/layout/fullscreen-layout";
import { fadeInUp } from "@/lib/animations";
import { CapturedPhoto, CaptureModeConfig } from "@/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ResultPreviewProps {
  photos: CapturedPhoto[];
  config: CaptureModeConfig;
  onRetakeAll: () => void;
  onBack: () => void;
}

export function ResultPreview({ photos, config, onRetakeAll, onBack }: ResultPreviewProps) {
  const router = useRouter();

  const handleContinue = () => {
    // Navigate to the next step in the pipeline
    router.push("/photo-booth/background");
  };

  const renderLayout = () => {
    if (photos.length === 0) return null;

    if (config.previewLayout === "single") {
      return (
        <div className="relative aspect-[16/9] w-full sm:aspect-[4/3] md:aspect-video lg:w-[800px]">
          <Image
            src={photos[0].image}
            alt="Captured photo"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      );
    }

    if (config.previewLayout === "grid") {
      return (
        <div className="grid aspect-square w-full max-w-[600px] grid-cols-2 grid-rows-2 gap-2 bg-black p-2 sm:gap-4 sm:p-4">
          {photos.slice(0, 4).map((photo, i) => (
            <div key={photo.id} className="relative h-full w-full overflow-hidden rounded-md bg-muted">
              <Image
                src={photo.image}
                alt={`Grid photo ${i + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      );
    }

    if (config.previewLayout === "filmStrip") {
      return (
        <div className="flex w-full max-w-[280px] flex-col gap-4 bg-white p-4 shadow-xl">
          {photos.slice(0, 4).map((photo, i) => (
            <div key={photo.id} className="relative aspect-[4/3] w-full overflow-hidden bg-black">
              <Image
                src={photo.image}
                alt={`Strip photo ${i + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
          {/* Logo or placeholder at the bottom of the strip */}
          <div className="flex h-12 items-center justify-center border-t-2 border-black/10 pt-2">
            <span className="text-sm font-black tracking-widest text-black/40">VISION</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <FullscreenLayout
      className="bg-background/95"
      headerLeft={
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      }
      headerRight={
        <Button 
          className="rounded-full px-6 font-bold shadow-lg"
          onClick={handleContinue}
        >
          Continue
          <Check className="ml-2 h-4 w-4" />
        </Button>
      }
    >
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex h-full w-full flex-col items-center justify-center p-6"
      >
        <div className={cn(
          "relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl",
          config.previewLayout === "filmStrip" ? "bg-transparent border-none shadow-none" : ""
        )}>
          {renderLayout()}

          <div className={cn(
            "flex w-full items-center justify-center p-6",
            config.previewLayout === "filmStrip" ? "mt-6 max-w-[280px] rounded-2xl border border-border bg-card shadow-lg" : ""
          )}>
            <button
              onClick={onRetakeAll}
              className="inline-flex h-12 items-center gap-2 rounded-xl px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-6"
            >
              <RotateCcw className="h-4 w-4" />
              Retake All
            </button>
          </div>
        </div>
      </motion.div>
    </FullscreenLayout>
  );
}
