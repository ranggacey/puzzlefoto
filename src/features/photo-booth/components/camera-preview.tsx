import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface CameraPreviewProps {
  stream: MediaStream | null;
  facingMode: "user" | "environment";
  className?: string;
}

export function CameraPreview({ stream, facingMode, className }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (stream) {
      videoElement.srcObject = stream;
      
      // Attempt to auto-play to prevent black screens on some devices
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Auto-play was prevented or interrupted:", error);
        });
      }
    } else {
      videoElement.srcObject = null;
    }
  }, [stream]);

  if (!stream) return null;

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
