export interface PuzzlePiece {
  id: string;
  sourceImageId: string;
  row: number;
  col: number;
  sourceRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  correctPosition: {
    x: number;
    y: number;
  };
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
  isLocked: boolean;
}
