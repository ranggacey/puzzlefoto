import { useState, useCallback, useRef, useEffect } from "react";
import { NormalizedPointerEvent } from "@/features/hand-tracking/types/gesture-state";

export interface DragState {
  isDragging: boolean;
  draggedPieceId: string | null;
  dragDeltaX: number; // in pixels
  dragDeltaY: number; // in pixels
  currentX: number; // in pixels (clientX)
  currentY: number; // in pixels (clientY)
  boardRect: DOMRect | null;
}

interface UseUnifiedDragProps {
  boardRef: React.RefObject<HTMLDivElement | null>;
  onDrop: (pieceId: string, clientX: number, clientY: number) => void;
}

export function useUnifiedDrag({ boardRef, onDrop }: UseUnifiedDragProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedPieceId: null,
    dragDeltaX: 0,
    dragDeltaY: 0,
    currentX: 0,
    currentY: 0,
    boardRect: null,
  });

  const startPos = useRef({ x: 0, y: 0 });

  // Generic handler for pointer down
  const handlePointerDown = useCallback((pieceId: string, clientX: number, clientY: number) => {
    startPos.current = { x: clientX, y: clientY };
    setDragState({
      isDragging: true,
      draggedPieceId: pieceId,
      dragDeltaX: 0,
      dragDeltaY: 0,
      currentX: clientX,
      currentY: clientY,
      boardRect: boardRef.current ? boardRef.current.getBoundingClientRect() : null,
    });
  }, [boardRef]);

  // Generic handler for pointer move
  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    setDragState((prev) => {
      if (!prev.isDragging) return prev;
      return {
        ...prev,
        dragDeltaX: clientX - startPos.current.x,
        dragDeltaY: clientY - startPos.current.y,
        currentX: clientX,
        currentY: clientY,
      };
    });
  }, []);

  // Generic handler for pointer up
  const handlePointerUp = useCallback((clientX: number, clientY: number) => {
    setDragState((prev) => {
      if (prev.isDragging && prev.draggedPieceId) {
        onDrop(prev.draggedPieceId, clientX, clientY);
      }
      return {
        isDragging: false,
        draggedPieceId: null,
        dragDeltaX: 0,
        dragDeltaY: 0,
        currentX: 0,
        currentY: 0,
        boardRect: null,
      };
    });
  }, [onDrop]);

  // Handle native mouse/touch events on the window to support dragging outside the board
  useEffect(() => {
    const onNativeMove = (e: PointerEvent) => handlePointerMove(e.clientX, e.clientY);
    const onNativeUp = (e: PointerEvent) => handlePointerUp(e.clientX, e.clientY);

    window.addEventListener("pointermove", onNativeMove);
    window.addEventListener("pointerup", onNativeUp);
    window.addEventListener("pointercancel", onNativeUp);

    return () => {
      window.removeEventListener("pointermove", onNativeMove);
      window.removeEventListener("pointerup", onNativeUp);
      window.removeEventListener("pointercancel", onNativeUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  return {
    dragState,
    handlePointerDown,
    // Provide a way to feed synthetic events from Hand Tracking
    feedSyntheticEvent: useCallback((event: NormalizedPointerEvent) => {
      if (!boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const clientX = rect.left + event.x * rect.width;
      const clientY = rect.top + event.y * rect.height;

      if (event.type === "pointerDown" && event.hoveredPieceId) {
        handlePointerDown(event.hoveredPieceId, clientX, clientY);
      } else if (event.type === "pointerMove") {
        handlePointerMove(clientX, clientY);
      } else if (event.type === "pointerUp") {
        handlePointerUp(clientX, clientY);
      }
    }, [boardRef, handlePointerDown, handlePointerMove, handlePointerUp])
  };
}
