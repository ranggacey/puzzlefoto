import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CaptureProgressProps {
  requiredPhotos: number;
  currentCount: number;
  latestThumbnail: string | null;
}

export function CaptureProgress({
  requiredPhotos,
  currentCount,
  latestThumbnail,
}: CaptureProgressProps) {
  if (requiredPhotos <= 1) return null; // Only show for multi-capture modes

  return (
    <div className="absolute top-10 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-3">
      {/* Dots Indicator */}
      <div className="flex items-center gap-2 rounded-full bg-background/50 px-4 py-2 backdrop-blur-md">
        {Array.from({ length: requiredPhotos }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-all duration-300",
              i < currentCount ? "bg-primary scale-110" : "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
      <div className="rounded-full bg-background/50 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-md">
        Photo {Math.min(currentCount + 1, requiredPhotos)} / {requiredPhotos}
      </div>

      {/* Fly-in Thumbnail Animation */}
      <AnimatePresence>
        {latestThumbnail && (
          <motion.div
            key={currentCount} // Animate each new capture
            initial={{ opacity: 0, scale: 1.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            className="absolute top-16 h-24 w-16 overflow-hidden rounded-md border-2 border-primary shadow-2xl"
          >
            <Image
              src={latestThumbnail}
              alt="Latest capture"
              fill
              className="object-cover"
              unoptimized
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
