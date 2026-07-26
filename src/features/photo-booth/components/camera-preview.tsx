import { useEffect, useRef } from "react";
import { usePhotoBoothCamera } from "@/features/photo-booth/hooks/use-photo-booth-camera";
import { FacingMode } from "@/features/photo-booth/types/camera";
import { cameraDebug, endCameraTimer } from "@/features/photo-booth/utils/camera-debug";

interface CameraPreviewProps {
  facingMode?: FacingMode;
  className?: string;
}

export function CameraPreview({ facingMode, className }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const camera = usePhotoBoothCamera();

  useEffect(() => {
    cameraDebug("[Preview] mounted");
    return () => {
      cameraDebug("[Preview] unmounted");
    };
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (el) {
      cameraDebug("[Preview] video ref attached");
    }
    camera.attachVideo(el);
    return () => {
      camera.attachVideo(null);
    };
  }, [camera]);

  const getTransform = () => {
    if (facingMode === "user") {
      return "scaleX(-1)";
    }
    return "none";
  };

  return (
    <div className={`relative h-full w-full overflow-hidden bg-black ${className || ""}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover transition-transform duration-300"
        style={{ transform: getTransform() }}
        onLoadedMetadata={() => {
          cameraDebug("[Preview] metadata loaded");
        }}
        onCanPlay={() => {
          cameraDebug("[Preview] can play");
        }}
        onPlaying={() => {
          cameraDebug("[Preview] playing");
          endCameraTimer("videoPlay");
        }}
        onPause={() => {
          cameraDebug("[Preview] paused");
        }}
        onError={(e) => {
          cameraDebug("[Preview] video error", e.currentTarget.error);
        }}
      />
    </div>
  );
}
