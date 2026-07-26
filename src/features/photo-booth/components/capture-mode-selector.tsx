import { motion } from "motion/react";
import { CaptureModeConfig, CaptureMode } from "@/types";
import { ModeCard } from "./mode-card";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CaptureModeSelectorProps {
  configs: CaptureModeConfig[];
  selectedModeId: string | null;
  onSelectMode: (modeId: CaptureMode) => void;
  onStart: () => void;
}

export function CaptureModeSelector({
  configs,
  selectedModeId,
  onSelectMode,
  onStart,
}: CaptureModeSelectorProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-6 pt-20">
      
      {/* Back Button */}
      <Link 
        href="/"
        className="absolute left-6 top-6 flex h-12 items-center gap-2 rounded-full bg-muted/50 px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </Link>

      <div className="w-full max-w-5xl">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12 text-center"
        >
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Choose Your Style
          </h1>
          <p className="text-lg text-muted-foreground">
            Select a capture mode to start the photo booth experience.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {configs.map((config) => (
            <motion.div key={config.id} variants={fadeInUp}>
              <ModeCard
                config={config}
                isSelected={selectedModeId === config.id}
                onSelect={() => onSelectMode(config.id)}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mt-12 flex justify-center"
        >
          <button
            onClick={onStart}
            disabled={!selectedModeId}
            className="inline-flex h-14 items-center justify-center rounded-xl bg-primary px-10 text-base font-semibold text-primary-foreground shadow-glow transition-all hover:bg-primary/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Start Camera
          </button>
        </motion.div>
      </div>
    </div>
  );
}
