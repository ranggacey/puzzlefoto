import { useState, useCallback, useRef, useEffect } from "react";
import { NormalizedPointerEvent } from "@/features/hand-tracking/types/gesture-state";
import { useGlobalPointer } from "@/features/hand-tracking/providers/global-pointer-provider";

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
  const { pointerState } = useGlobalPointer();
  
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
    if (pointerState.source === "hand") return; // Hand tracking uses Select & Swap

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
  }, [boardRef, pointerState.source]);

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

  // Automatically update drag position based on global pointer state
  useEffect(() => {
    if (!dragState.isDragging || pointerState.source === "hand") return;
    
    const clientX = pointerState.x * window.innerWidth;
    const clientY = pointerState.y * window.innerHeight;

    if (pointerState.phase === "pressed" || pointerState.phase === "dragging" || pointerState.phase === "hover") { 
       // We let pointerUp handle the release explicitly in hand tracking or mouse
       handlePointerMove(clientX, clientY);
    }
  }, [pointerState.x, pointerState.y, pointerState.phase, dragState.isDragging, handlePointerMove, pointerState.source]);

  // Handle native mouse/touch events on the window to support dragging outside the board
  // We keep this for native touch/mouse interactions that might slip out of the window
  useEffect(() => {
    const onNativeMove = (e: PointerEvent) => {
      if (pointerState.source !== "hand") handlePointerMove(e.clientX, e.clientY);
    };
    const onNativeUp = (e: PointerEvent) => {
      if (pointerState.source !== "hand") handlePointerUp(e.clientX, e.clientY);
    };

    window.addEventListener("pointermove", onNativeMove);
    window.addEventListener("pointerup", onNativeUp);
    window.addEventListener("pointercancel", onNativeUp);

    return () => {
      window.removeEventListener("pointermove", onNativeMove);
      window.removeEventListener("pointerup", onNativeUp);
      window.removeEventListener("pointercancel", onNativeUp);
    };
  }, [handlePointerMove, handlePointerUp, pointerState.source]);

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
    }, [boardRef, handlePointerDown, handlePointerMove, handlePointerUp]),
    
    // Direct call for the new interaction dispatcher
    forcePointerUp: useCallback(() => {
      const clientX = pointerState.x * window.innerWidth;
      const clientY = pointerState.y * window.innerHeight;
      handlePointerUp(clientX, clientY);
    }, [handlePointerUp, pointerState.x, pointerState.y])
  };
}
