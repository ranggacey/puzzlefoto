import { useState, useRef, useEffect } from "react";
import { BackgroundPreview } from "./background-preview";
import type { BackgroundConfig } from "../types";
import type { CapturedPhoto } from "@/types";

interface BackgroundComparisonProps {
  photo: CapturedPhoto | null;
  mask: Uint8ClampedArray | null;
  config: BackgroundConfig;
}

export function BackgroundComparison({ photo, mask, config }: BackgroundComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const onPointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    const handleMoveWindow = (e: PointerEvent) => {
      if (isDragging) handleMove(e.clientX);
    };

    if (isDragging) {
      window.addEventListener("pointerup", handleUp);
      window.addEventListener("pointermove", handleMoveWindow);
    }
    return () => {
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointermove", handleMoveWindow);
    };
  }, [isDragging]);

  if (!photo) return null;

  if (config.type === "original") {
    return <BackgroundPreview photo={photo} mask={mask} config={config} />;
  }

  return (
    <div 
      ref={containerRef}
      className="relative flex h-full w-full select-none touch-none items-center justify-center overflow-hidden"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* 1. After (Processed image via canvas) */}
      <div className="absolute inset-0">
        <BackgroundPreview photo={photo} mask={mask} config={config} />
      </div>

      {/* 2. Before (Original Image, clipped) */}
      <div 
        className="absolute inset-0 z-10 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <div className="relative flex h-full w-full items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={photo.image} 
            alt="Original" 
            className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" 
          />
        </div>
      </div>

      {/* 3. Slider Handle */}
      <div 
        className="absolute bottom-0 top-0 z-20 flex w-1 cursor-col-resize items-center justify-center bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-md">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
}
