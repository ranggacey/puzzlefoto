import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useCamera } from "@/features/photo-booth/hooks/use-camera";
import { FacingMode } from "@/features/photo-booth/types/camera";

interface CameraPreviewProps {
  facingMode: FacingMode;
  className?: string;
}

export function CameraPreview({ facingMode, className }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const camera = useCamera();

  useEffect(() => {
    // Attach the video element to the CameraProvider
    camera.attachVideo(videoRef.current);

    // Detach on unmount
    return () => {
      camera.attachVideo(null);
    };
  }, [camera]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={cn(
        "h-full w-full object-cover transition-transform duration-300",
        facingMode === "user" && "scale-x-[-1]", // Mirror front camera
        className
      )}
    />
  );
}
