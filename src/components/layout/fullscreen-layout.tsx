import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { APP_HEADER_HEIGHT } from "@/constants/layout";

interface FullscreenLayoutProps {
  children: ReactNode;
  /** Controls to render in the top-left safe area (e.g., Back button, Breadcrumbs) */
  headerLeft?: ReactNode;
  /** Controls to render in the top-right safe area (e.g., Continue, ThemeToggle, Status) */
  headerRight?: ReactNode;
  /** Any custom class names for the root container */
  className?: string;
}

export function FullscreenLayout({ 
  children, 
  headerLeft, 
  headerRight, 
  className 
}: FullscreenLayoutProps) {
  return (
    <div className={cn("relative flex h-screen w-full flex-col overflow-hidden bg-background", className)}>
      
      {/* 
        The safe area for floating actions.
        It strictly respects the global APP_HEADER_HEIGHT, preventing overlaps with the global Navbar. 
      */}
      <div 
        className="absolute inset-x-0 z-40 p-6 pointer-events-none flex items-start justify-between"
        style={{ top: `${APP_HEADER_HEIGHT}px` }}
      >
        <div className="pointer-events-auto flex items-center gap-2">
          {headerLeft}
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          {headerRight}
        </div>
      </div>
      
      {/* 
        Main Immersive Content.
        Features render their primary UI here (Canvas, Camera, etc).
        It stretches edge-to-edge underneath the navbar. 
      */}
      <div className="absolute inset-0 z-0">
        {children}
      </div>
    </div>
  );
}
