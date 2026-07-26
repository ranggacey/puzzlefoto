"use client";

import { useEffect, useRef } from "react";
import { usePuzzleCamera } from "../hooks/use-puzzle-camera";
import { cameraDebug, endCameraTimer } from "@/features/photo-booth/utils/camera-debug";

export function LiveBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { attachVideo, state, facingMode } = usePuzzleCamera();

  useEffect(() => {
    cameraDebug("[LiveBackground] mounted");
    // Camera is automatically started by PuzzleCameraProvider
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      attachVideo(videoRef.current);
    }
  }, [attachVideo]);

  const handlePlaying = () => {
    endCameraTimer("videoPlay");
    cameraDebug("[LiveBackground] video playing natively");
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onPlaying={handlePlaying}
        className={`h-full w-full object-cover transition-opacity duration-700 ${
          state === "READY" ? "opacity-100" : "opacity-0"
        } ${facingMode === "user" ? "-scale-x-100" : ""}`}
      />
      {/* Dimming overlay so foreground stands out */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
    </div>
  );
}
