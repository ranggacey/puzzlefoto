import { motion } from "motion/react";
import { Check, RotateCcw } from "lucide-react";
import Image from "next/image";
import { fadeInUp } from "@/lib/animations";

interface ResultPreviewProps {
  imageUrl: string;
  onRetake: () => void;
  onContinue: () => void;
}

export function ResultPreview({ imageUrl, onRetake, onContinue }: ResultPreviewProps) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background p-6">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="relative aspect-video w-full bg-black/5">
          <Image
            src={imageUrl}
            alt="Captured photo"
            fill
            className="object-cover"
            unoptimized // Data URL doesn't need Next.js image optimization
          />
        </div>

        <div className="flex items-center justify-between p-6">
          <button
            onClick={onRetake}
            className="inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="h-4 w-4" />
            Retake
          </button>
          
          <button
            onClick={onContinue}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Continue
            <Check className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
