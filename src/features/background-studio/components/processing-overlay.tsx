import { Loader2 } from "lucide-react";
import type { ProcessingStatus, ProcessingProgress } from "../types";

interface ProcessingOverlayProps {
  status: ProcessingStatus;
  progress: ProcessingProgress;
}

export function ProcessingOverlay({ status, progress }: ProcessingOverlayProps) {
  if (status === "IDLE" || status === "READY" || status === "DONE" || status === "ERROR") {
    return null;
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-white backdrop-blur-sm">
      <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
      
      <h2 className="text-xl font-bold tracking-tight">
        {status === "INITIALIZING" && "Initializing AI Engine..."}
        {status === "PROCESSING" && "Removing Background..."}
      </h2>
      
      {status === "PROCESSING" && progress.total > 1 && (
        <p className="mt-2 text-sm text-muted-foreground">
          Processing photo {progress.current} of {progress.total}
        </p>
      )}
    </div>
  );
}
