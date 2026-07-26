import { Camera } from "lucide-react";
import { motion } from "motion/react";
import { fadeInUp } from "@/lib/animations";

interface PermissionScreenProps {
  onGrantPermission: () => void;
  isDenied?: boolean;
}

export function PermissionScreen({ onGrantPermission, isDenied }: PermissionScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background p-6 text-center z-10">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex max-w-md flex-col items-center"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-primary">
          <Camera className="h-10 w-10" />
        </div>
        
        <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
          Camera Access Required
        </h2>
        
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          {isDenied 
            ? "You have denied camera access. Please update your browser settings to allow access to the camera, then reload the page."
            : "Vision Puzzle needs access to your camera to take photos and enable hand-tracking gameplay."}
        </p>

        {!isDenied && (
          <button
            onClick={onGrantPermission}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Grant Permission
          </button>
        )}
      </motion.div>
    </div>
  );
}
