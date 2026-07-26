export interface PuzzleSlot {
  index: number;
  row: number;
  col: number;
}

export interface PuzzlePiece {
  id: string;
  sourceImageId: string;
  
  correctSlotIndex: number;
  currentSlotIndex: number;
  
  sourceRow: number;
  sourceCol: number;
  
  isLocked: boolean;
}
