import { SwitchCamera, Maximize, Minimize, Settings2, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { fullscreenService } from "../services/fullscreen.service";
import type { CountdownOption } from "../constants/camera";

interface CameraControlsProps {
  onCapture: () => void;
  onSwitchCamera: () => void;
  hasMultipleCameras: boolean;
  activeCountdown: CountdownOption;
  onToggleCountdown: () => void;
  isCapturing: boolean;
}

export function CameraControls({
  onCapture,
  onSwitchCamera,
  hasMultipleCameras,
  activeCountdown,
  onToggleCountdown,
  isCapturing,
}: CameraControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(fullscreenService.isFullscreen());
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleFullscreenToggle = async () => {
    await fullscreenService.toggleFullscreen();
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end bg-gradient-to-t from-background/80 to-transparent p-6 pb-10">
      
      {/* Secondary Controls (Future extensible) */}
      <div className="mb-6 flex w-full max-w-sm justify-between px-4">
        <button
          onClick={handleFullscreenToggle}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-background/50 text-foreground backdrop-blur-md transition-colors hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </button>

        <button
          onClick={onToggleCountdown}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            activeCountdown > 0 
              ? "bg-primary text-primary-foreground" 
              : "bg-background/50 text-foreground hover:bg-background/80"
          )}
          aria-label={`Timer: ${activeCountdown > 0 ? activeCountdown + 's' : 'Off'}`}
        >
          <div className="relative">
            <Timer className="h-5 w-5" />
            {activeCountdown > 0 && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-background text-[9px] font-bold text-foreground">
                {activeCountdown}
              </span>
            )}
          </div>
        </button>

        {hasMultipleCameras && (
          <button
            onClick={onSwitchCamera}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-background/50 text-foreground backdrop-blur-md transition-colors hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Switch camera"
          >
            <SwitchCamera className="h-5 w-5" />
          </button>
        )}
        
        {/* Placeholder for future settings (e.g. Resolution, Background) */}
        <button
          className="flex h-12 w-12 items-center justify-center rounded-full bg-background/50 text-muted-foreground backdrop-blur-md transition-colors hover:bg-background/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Settings"
          title="Settings (Coming soon)"
        >
          <Settings2 className="h-5 w-5" />
        </button>
      </div>

      {/* Primary Shutter Button */}
      <button
        onClick={onCapture}
        disabled={isCapturing}
        className={cn(
          "relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-foreground bg-transparent transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50",
          isCapturing ? "scale-95 opacity-50" : "hover:scale-105 active:scale-95"
        )}
        aria-label="Take photo"
      >
        <div className="h-16 w-16 rounded-full bg-foreground transition-transform" />
      </button>

    </div>
  );
}
