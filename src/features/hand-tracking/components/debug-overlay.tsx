"use client";

import React, { useState, useEffect } from "react";
import { useHandTrackingDiagnostics } from "../store/hand-tracking-diagnostics-store";
import { useSearchParams } from "next/navigation";

export function HandTrackingDebugOverlay() {
  const searchParams = useSearchParams();
  const debugEnv = process.env.NEXT_PUBLIC_HAND_DEBUG === "true";
  const debugQuery = searchParams.get("debugHandTracking") === "true";
  
  const isEnabled = debugEnv || debugQuery;
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const { camera, inferenceFps, renderFps, tracking, events } = useHandTrackingDiagnostics();

  if (!mounted || !isEnabled) return null;

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="absolute top-4 right-4 z-[9999] bg-black/80 text-white text-xs px-3 py-1 rounded border border-white/20 hover:bg-black font-mono shadow-lg"
      >
        Show Hand Diagnostics
      </button>
    );
  }

  const recoveryRate = tracking.losses > 0 
    ? Math.round((tracking.recoveries / tracking.losses) * 100) 
    : 100;

  return (
    <div className="absolute top-4 right-4 z-[9999] bg-black/90 text-green-400 text-xs p-4 rounded-lg border border-green-500/30 font-mono shadow-2xl w-80 max-h-[90vh] overflow-y-auto flex flex-col gap-4 select-none">
      <div className="flex justify-between items-center border-b border-green-500/30 pb-2">
        <h3 className="font-bold text-white uppercase tracking-wider">Hand Diagnostics</h3>
        <button 
          onClick={() => setIsExpanded(false)}
          className="text-white/50 hover:text-white px-2 py-1"
        >
          Close
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <div className="text-white/70 uppercase text-[10px] tracking-widest mb-1 border-b border-white/10 pb-1">Camera</div>
        <div className="flex justify-between"><span>Resolution</span><span className="text-white">{camera?.width ?? 0}×{camera?.height ?? 0}</span></div>
        <div className="flex justify-between"><span>Camera FPS</span><span className="text-white">{camera?.frameRate ?? 0}</span></div>
        <div className="flex justify-between">
          <span>Inference FPS</span>
          <span className={inferenceFps.average < 20 ? "text-red-400" : "text-white"}>{inferenceFps.average} (avg)</span>
        </div>
        <div className="flex justify-between">
          <span>Render FPS</span>
          <span className={renderFps.average < 30 ? "text-red-400" : "text-white"}>{renderFps.average} (avg)</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="text-white/70 uppercase text-[10px] tracking-widest mb-1 border-b border-white/10 pb-1">Tracking</div>
        <div className="flex justify-between"><span>Confidence</span><span className="text-white">{(tracking.averageConfidence * 100).toFixed(1)}%</span></div>
        <div className="flex justify-between"><span>Min Confidence</span><span className="text-white">{(tracking.lowestConfidence * 100).toFixed(1)}%</span></div>
        <div className="flex justify-between"><span>Pinch Events</span><span className="text-white">{tracking.pinchEvents}</span></div>
        <div className="flex justify-between"><span>Successful Grabs</span><span className="text-white">{tracking.successfulGrabs}</span></div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="text-white/70 uppercase text-[10px] tracking-widest mb-1 border-b border-white/10 pb-1">Stability Stats</div>
        <div className="flex justify-between"><span>Tracking Losses</span><span className="text-white">{tracking.losses}</span></div>
        <div className="flex justify-between"><span>Recoveries</span><span className="text-white">{tracking.recoveries}</span></div>
        <div className="flex justify-between"><span>Recovery Rate</span><span className="text-white">{recoveryRate}%</span></div>
        <div className="flex justify-between"><span>Avg Recovery</span><span className="text-white">{tracking.averageRecoveryDurationMs} ms</span></div>
        <div className="flex justify-between"><span>Longest Recovery</span><span className="text-white">{Math.round(tracking.longestRecoveryMs)} ms</span></div>
        <div className="flex justify-between">
          <span>Accidental Releases</span>
          <span className={tracking.accidentalReleases > 0 ? "text-red-400" : "text-white"}>{tracking.accidentalReleases}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="text-white/70 uppercase text-[10px] tracking-widest mb-1 border-b border-white/10 pb-1">Event Log</div>
        <div className="flex flex-col gap-1 mt-1 max-h-40 overflow-y-auto">
          {events.length === 0 ? (
            <span className="text-white/40 italic">No events yet...</span>
          ) : (
            events.slice(0, 15).map(event => (
              <div key={event.id} className="text-[10px] leading-tight">
                <span className="text-white/50 w-12 inline-block">{event.formattedTime}</span>
                <span className={
                  event.type === "Tracking Lost" || event.type === "Accidental Release" ? "text-red-400" : 
                  event.type === "Tracking Recovered" ? "text-green-400" : 
                  "text-blue-300"
                }>{event.type}</span>
                {event.reason && <span className="text-white/60 ml-2">({event.reason})</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
