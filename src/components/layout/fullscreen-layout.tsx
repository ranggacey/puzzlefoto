import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LAYOUT } from "@/constants/layout";

interface FullscreenLayoutProps {
  children: ReactNode;
  /** Controls to render in the top-left safe area (e.g., Back button, Breadcrumbs) */
  headerLeft?: ReactNode;
  /** Controls to render in the top-center safe area (e.g., Status Badge, Timer) */
  headerCenter?: ReactNode;
  /** Controls to render in the top-right safe area (e.g., Continue, ThemeToggle) */
  headerRight?: ReactNode;
  /** Any custom class names for the root container */
  className?: string;
}

export function FullscreenLayout({ 
  children, 
  headerLeft, 
  headerCenter,
  headerRight, 
  className 
}: FullscreenLayoutProps) {
  return (
    <div className={cn("relative flex h-screen w-full flex-col overflow-hidden bg-background", className)}>
      
      {/* 
        The safe area for floating actions.
        It strictly respects the layout tokens, completely avoiding magic numbers.
      */}
      <div 
        className="absolute inset-x-0 z-40 pointer-events-none flex items-start justify-between"
        style={{ 
          top: `${LAYOUT.HEADER_HEIGHT}px`,
          padding: `${LAYOUT.FLOATING_PADDING}px`
        }}
      >
        <div 
          className="pointer-events-auto flex items-center"
          style={{ gap: `${LAYOUT.FLOATING_GAP}px` }}
        >
          {headerLeft}
        </div>

        {headerCenter && (
          <div 
            className="pointer-events-auto absolute left-1/2 -translate-x-1/2 flex items-center"
            style={{ gap: `${LAYOUT.FLOATING_GAP}px` }}
          >
            {headerCenter}
          </div>
        )}

        <div 
          className="pointer-events-auto flex items-center"
          style={{ gap: `${LAYOUT.FLOATING_GAP}px` }}
        >
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
