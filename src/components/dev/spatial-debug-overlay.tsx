"use client";

import React, { useEffect, useRef, useState } from "react";
import { interactionAssist } from "@/features/hand-tracking/services/interaction-assist";

export function SpatialDebugOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const isFrozenRef = useRef(isFrozen);

  useEffect(() => {
    isFrozenRef.current = isFrozen;
  }, [isFrozen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F9") {
        setIsFrozen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    let prevBoardRectStr = "";

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);

      if (isFrozenRef.current) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Match canvas internal resolution to window size
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const boardRect = interactionAssist.getBoardRectProp();
      const lastHitTest = interactionAssist.getLastHitTest();

      // Drift Detection (Board)
      if (boardRect) {
        const currentBoardRectStr = `${Math.round(boardRect.width)}x${Math.round(boardRect.height)}@${Math.round(boardRect.left)},${Math.round(boardRect.top)}`;
        if (prevBoardRectStr && prevBoardRectStr !== currentBoardRectStr) {
          console.warn(`[SpatialDebugOverlay] Board rect drifted from ${prevBoardRectStr} to ${currentBoardRectStr}`);
        }
        prevBoardRectStr = currentBoardRectStr;
      }

      // 1. Draw Board Rect
      if (boardRect) {
        ctx.strokeStyle = "rgba(0, 255, 255, 0.5)"; // Cyan
        ctx.lineWidth = 2;
        ctx.strokeRect(boardRect.left, boardRect.top, boardRect.width, boardRect.height);
        
        ctx.fillStyle = "rgba(0, 255, 255, 0.8)";
        ctx.font = "12px monospace";
        ctx.fillText(`Board: ${Math.round(boardRect.left)}, ${Math.round(boardRect.top)} [${Math.round(boardRect.width)}x${Math.round(boardRect.height)}]`, boardRect.left + 4, boardRect.top + 14);
      }

      // Check overlaps
      const visualOverlapSet = new Set<string>();
      const logicalOverlapSet = new Set<string>();
      let visualOverlapCount = 0;
      let logicalOverlapCount = 0;

      if (lastHitTest) {
        for (let i = 0; i < lastHitTest.candidates.length; i++) {
          for (let j = i + 1; j < lastHitTest.candidates.length; j++) {
            const v1 = lastHitTest.candidates[i].rect;
            const v2 = lastHitTest.candidates[j].rect;
            // Simple AABB overlap check (tolerance 1px) for Visual Bounds
            if (
              v1.left < v2.right - 1 &&
              v1.right > v2.left + 1 &&
              v1.top < v2.bottom - 1 &&
              v1.bottom > v2.top + 1
            ) {
              visualOverlapSet.add(lastHitTest.candidates[i].pieceId);
              visualOverlapSet.add(lastHitTest.candidates[j].pieceId);
              visualOverlapCount++;
            }

            const l1 = lastHitTest.candidates[i].logicalRect;
            const l2 = lastHitTest.candidates[j].logicalRect;
            // AABB overlap check for Logical Hitbox
            if (
              l1.left < l2.right - 1 &&
              l1.right > l2.left + 1 &&
              l1.top < l2.bottom - 1 &&
              l1.bottom > l2.top + 1
            ) {
              logicalOverlapSet.add(lastHitTest.candidates[i].pieceId);
              logicalOverlapSet.add(lastHitTest.candidates[j].pieceId);
              logicalOverlapCount++;
            }
          }
        }
      }

      // 2. Draw Piece Rects
      if (lastHitTest) {
        for (const candidate of lastHitTest.candidates) {
          const { pieceId, rect, logicalRect, inside } = candidate;
          const isChosen = pieceId === lastHitTest.chosenId;
          const hasVisualOverlap = visualOverlapSet.has(pieceId);
          const hasLogicalOverlap = logicalOverlapSet.has(pieceId);

          // Draw Visual Bounds (Gray)
          ctx.strokeStyle = hasVisualOverlap ? "rgba(255, 100, 100, 0.4)" : "rgba(128, 128, 128, 0.5)";
          ctx.lineWidth = 1;
          ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);

          // Draw Logical Hitbox
          if (isChosen) {
            ctx.strokeStyle = "rgba(0, 255, 0, 0.9)"; // Green
            ctx.fillStyle = "rgba(0, 255, 0, 0.1)";
          } else if (inside) {
            ctx.strokeStyle = "rgba(255, 255, 0, 0.9)"; // Yellow
            ctx.fillStyle = "rgba(255, 255, 0, 0.1)";
          } else if (hasLogicalOverlap) {
            ctx.strokeStyle = "rgba(255, 0, 255, 0.9)"; // Magenta (Overlap Warning)
            ctx.fillStyle = "rgba(255, 0, 255, 0.1)";
          } else {
            ctx.strokeStyle = "rgba(128, 255, 128, 0.3)"; // Light green outline
            ctx.fillStyle = "transparent";
          }

          ctx.lineWidth = inside || isChosen || hasLogicalOverlap ? 2 : 1;
          ctx.fillRect(logicalRect.left, logicalRect.top, logicalRect.width, logicalRect.height);
          ctx.strokeRect(logicalRect.left, logicalRect.top, logicalRect.width, logicalRect.height);

          // Draw Piece ID and details
          ctx.fillStyle = inside || isChosen ? "#FFF" : "rgba(200, 200, 200, 0.8)";
          ctx.font = "11px monospace";
          ctx.fillText(`ID: ${pieceId}`, rect.left + 4, rect.top + 14);
          
          if (hasLogicalOverlap) {
            ctx.fillStyle = "rgba(255, 0, 255, 1)";
            ctx.fillText(`LOGICAL OVERLAP`, rect.left + 4, rect.top + 26);
          } else if (hasVisualOverlap) {
            ctx.fillStyle = "rgba(255, 100, 100, 1)";
            ctx.fillText(`VISUAL OVERLAP`, rect.left + 4, rect.top + 26);
          }
        }
      }

      // 3. Draw Pointer
      if (lastHitTest) {
        ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
        ctx.beginPath();
        ctx.arc(lastHitTest.px, lastHitTest.py, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "white";
        ctx.font = "12px monospace";
        ctx.fillText(`Pointer: (${Math.round(lastHitTest.px)}, ${Math.round(lastHitTest.py)})`, lastHitTest.px + 10, lastHitTest.py);
      }

      // 4. Draw HUD
      const hudX = window.innerWidth - 320;
      let hudY = 100; // Right side to avoid overlapping other debug logs
      
      const hoveredCandidate = lastHitTest?.candidates.find(c => c.inside || c.pieceId === lastHitTest.chosenId);
      const hudHeight = 270 + (lastHitTest ? lastHitTest.candidates.length * 15 : 0) + (hoveredCandidate ? 70 : 0);

      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(hudX - 10, hudY - 20, 300, hudHeight);
      
      ctx.fillStyle = "white";
      ctx.font = "12px monospace";
      ctx.fillText(`Spatial Debug [F9 to ${isFrozenRef.current ? "Resume" : "Freeze"}]`, hudX, hudY);
      hudY += 20;

      if (lastHitTest) {
        ctx.fillText(`Pointer: (${Math.round(lastHitTest.px)}, ${Math.round(lastHitTest.py)})`, hudX, hudY);
        hudY += 20;
        
        ctx.fillStyle = "rgba(200, 200, 200, 1)";
        ctx.fillText(`Visual Overlaps  : ${visualOverlapCount}`, hudX, hudY);
        hudY += 15;
        ctx.fillStyle = logicalOverlapCount > 0 ? "rgba(255, 0, 255, 1)" : "rgba(0, 255, 0, 1)";
        ctx.fillText(`Logical Overlaps : ${logicalOverlapCount}`, hudX, hudY);
        hudY += 25;

        const iaTarget = lastHitTest.chosenId || "None";
        const brTarget = lastHitTest.browserTargetId || "None";
        
        ctx.fillStyle = iaTarget === brTarget ? "rgba(0, 255, 0, 1)" : "rgba(255, 100, 100, 1)";
        ctx.fillText(`IAssist Target: ${iaTarget}`, hudX, hudY);
        hudY += 20;
        ctx.fillText(`Browser Target: ${brTarget}`, hudX, hudY);
        hudY += 30;

        if (hoveredCandidate) {
          const vArea = hoveredCandidate.rect.width * hoveredCandidate.rect.height;
          const lArea = hoveredCandidate.logicalRect.width * hoveredCandidate.logicalRect.height;
          const scaleStr = `${Math.round(hoveredCandidate.logicalRect.width / hoveredCandidate.rect.width * 100)}%`;

          ctx.fillStyle = "rgba(255, 255, 255, 1)";
          ctx.fillText(`Hovered Piece: ${hoveredCandidate.pieceId}`, hudX, hudY);
          hudY += 15;
          ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
          ctx.fillText(`Visual bounds : ${Math.round(hoveredCandidate.rect.width)} × ${Math.round(hoveredCandidate.rect.height)}`, hudX, hudY);
          hudY += 15;
          ctx.fillStyle = "rgba(128, 255, 128, 0.8)";
          ctx.fillText(`Logical bounds: ${Math.round(hoveredCandidate.logicalRect.width)} × ${Math.round(hoveredCandidate.logicalRect.height)}`, hudX, hudY);
          hudY += 15;
          ctx.fillStyle = "rgba(255, 255, 0, 0.8)";
          ctx.fillText(`Logical scale : ${scaleStr}`, hudX, hudY);
          hudY += 25;
        }

        ctx.fillStyle = "white";
        ctx.fillText(`Registry Order (${lastHitTest.candidates.length} pieces):`, hudX, hudY);
        hudY += 15;
        
        lastHitTest.candidates.forEach((c, idx) => {
          if (c.pieceId === lastHitTest.chosenId) {
            ctx.fillStyle = "rgba(0, 255, 0, 1)";
          } else if (c.inside) {
            ctx.fillStyle = "rgba(255, 255, 0, 1)";
          } else {
            ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
          }
          ctx.fillText(`${idx} → Piece ${c.pieceId} ${c.inside ? "(INSIDE)" : ""}`, hudX + 10, hudY);
          hudY += 15;
        });
      }

    };

    animationFrameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ display: "block" }}
    />
  );
}
