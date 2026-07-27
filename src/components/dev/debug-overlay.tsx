"use client";

import React, { useEffect, useState } from "react";
import { InteractionLogger } from "@/lib/debug/interaction-logger";

export function DebugOverlay() {
  const [metrics, setMetrics] = useState(InteractionLogger.getMetrics());
  
  // Since we aren't mutating React state with every logger call (to avoid re-renders)
  // we just poll the metrics every 100ms for the debug overlay.
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    
    const intervalId = setInterval(() => {
      setMetrics(InteractionLogger.getMetrics());
    }, 100);
    
    return () => clearInterval(intervalId);
  }, []);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-black/80 text-green-400 font-mono text-xs p-4 rounded-lg border border-green-500/30 pointer-events-none shadow-xl max-w-sm">
      <div className="flex items-center justify-between mb-2 border-b border-green-500/30 pb-2">
        <span className="font-bold">E2E DEBUG PIPELINE</span>
        <span className="text-green-200 opacity-70">Interaction #{metrics.interactionId}</span>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-white/50">State</span>
          <span className="font-bold">{metrics.currentState}</span>
        </div>
        
        <div className="flex justify-between gap-4">
          <span className="text-white/50">Timeline Events</span>
          <span>{metrics.timelineCount}</span>
        </div>
        
        <div className="pt-2 mt-2 border-t border-green-500/30">
          <span className="text-white/50 block mb-1">Last Transition:</span>
          <span className="text-[10px] break-words text-green-300">
            {metrics.lastEvent}
          </span>
        </div>
      </div>
    </div>
  );
}
