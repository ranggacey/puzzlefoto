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
    if (videoRef.current && stream) {
      // Connect stream to video element
      videoRef.current.srcObject = stream;
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
