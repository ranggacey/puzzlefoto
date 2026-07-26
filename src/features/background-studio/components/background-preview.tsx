import { useEffect, useRef } from "react";
import { compositorService } from "../services/compositor.service";
import type { BackgroundConfig } from "../types";
import type { CapturedPhoto } from "@/types";

interface BackgroundPreviewProps {
  photo: CapturedPhoto | null;
  mask: Uint8ClampedArray | null;
  config: BackgroundConfig;
}

export function BackgroundPreview({ photo, mask, config }: BackgroundPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!photo || !canvasRef.current) return;
    
    const img = new Image();
    img.src = photo.image;
    img.onload = () => {
      if (canvasRef.current) {
        compositorService.composeToCanvas(canvasRef.current, img, mask, config);
      }
    };
  }, [photo, mask, config]);

  if (!photo) {
    return <div className="h-full w-full bg-muted flex items-center justify-center">No Photo Selected</div>;
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="max-h-full max-w-full object-contain shadow-2xl rounded-xl transition-all duration-300"
        style={{
          // Use CSS background pattern to show transparency grid if transparent
          backgroundImage: config.type === "transparent" ? 'url("data:image/svg+xml,%3Csvg width=\'16\' height=\'16\' viewBox=\'0 0 16 16\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h8v8H0zm8 8h8v8H8z\' fill=\'%23f3f4f6\' fill-rule=\'evenodd\'/%3E%3Cpath d=\'M8 0h8v8H8zM0 8h8v8H0z\' fill=\'%23e5e7eb\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' : 'none',
        }}
      />
    </div>
  );
}
