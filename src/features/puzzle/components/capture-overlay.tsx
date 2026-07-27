import { Camera } from "lucide-react";
import { motion } from "motion/react";
import { fadeInUp } from "@/lib/animations";
import { InteractionSurface } from "@/features/hand-tracking/components/interaction-surface";

interface CaptureOverlayProps {
  onCapture: () => void;
}

export function CaptureOverlay({ onCapture }: CaptureOverlayProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end pb-12 sm:pb-24">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-6"
      >
        <p className="text-sm font-medium text-white/80 drop-shadow-md">
          Take a photo to begin
        </p>

        <InteractionSurface onClick={onCapture} magnetic className="rounded-full">
          <button
            className="group relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/20 bg-transparent transition-transform hover:scale-105 active:scale-95"
            aria-label="Take Photo"
          >
            {/* Inner Circle */}
            <div className="absolute flex h-16 w-16 items-center justify-center rounded-full bg-white transition-transform group-hover:scale-95 group-active:scale-90">
              <Camera className="h-6 w-6 text-black/80" />
            </div>
          </button>
        </InteractionSurface>
      </motion.div>
    </div>
  );
}
