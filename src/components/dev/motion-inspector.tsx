"use client";

import { useEffect, useState } from "react";
import { motionTokens } from "@/lib/motion";

export function MotionInspector() {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<string>("none");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      if (target) {
        const tag = target.tagName.toLowerCase();
        const id = target.id ? `#${target.id}` : "";
        const className = target.className && typeof target.className === 'string' ? `.${target.className.split(" ")[0]}` : "";
        setHoveredElement(`${tag}${id}${className}`);
      } else {
        setHoveredElement("none");
      }
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] rounded-lg bg-black/80 p-4 font-mono text-[10px] text-green-400 border border-green-500/30 backdrop-blur-md shadow-2xl pointer-events-none w-64">
      <h3 className="mb-2 border-b border-green-500/30 pb-1 font-bold text-green-300 uppercase tracking-widest text-[9px]">
        Motion Inspector
      </h3>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span className="opacity-70">Reduced Motion:</span>
          <span className={isReducedMotion ? "text-yellow-300" : "text-green-300"}>
            {isReducedMotion ? "ENABLED" : "disabled"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Default Spring:</span>
          <span>{motionTokens.springs.interactive.stiffness} / {motionTokens.springs.interactive.damping}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Base Duration:</span>
          <span>{motionTokens.durations.normal}s</span>
        </div>
        <div className="flex flex-col mt-1">
          <span className="opacity-70">Hovered Node:</span>
          <span className="truncate text-white bg-white/10 px-1 py-0.5 rounded mt-0.5" title={hoveredElement}>
            {hoveredElement}
          </span>
        </div>
      </div>
    </div>
  );
}
