# Sprint 5.8.3 — Hover-to-Select Interaction Refinement

## Objective
Refine the Select & Swap gameplay by automatically selecting the first puzzle piece via a 500ms stable hover. This removes the need for a precise pinch gesture just to select a piece, reserving the pinch exclusively for swap confirmation. This iteration significantly reduces interaction friction for webcam-based hand tracking.

## Scope
- Replaced manual pinch selection with an automatic 500ms hover timer.
- Added a sleek SVG radial progress indicator inside `PuzzlePiece` to communicate auto-selection progress visually.
- Bound the hover timer logic strictly to the Interaction layer (`PuzzleBoard`), preserving `PuzzlePiece` as a pure declarative presentation component.
- Reserved the pinch gesture strictly for swap confirmation.

## Architecture Decisions
1. **Separation of Concerns**: The auto-select timing is calculated via `requestAnimationFrame` inside `PuzzleBoard`. The calculated `hoverProgress` is simply passed down to `PuzzlePiece`, which uses Framer Motion to smoothly render the SVG circle. `PuzzlePiece` has no concept of timers or game loops.
2. **Instant Cancellation**: If the `hoveredPieceId` changes before the 500ms timer completes, the `useEffect` immediately tears down and restarts the timer. No progress carries over between pieces.
3. **Selection Lock**: Once the auto-select successfully triggers `handlePieceSelection`, the selection is locked into `PuzzleStore`. Moving the pointer away preserves the selection indefinitely until it is cancelled or a swap occurs.

## Files Modified
- `src/features/puzzle/components/puzzle-board.tsx`
- `src/features/puzzle/components/puzzle-piece.tsx`

## Verification Results
- **Auto Selection**: Hovering an unselected piece fills the progress ring perfectly in 500ms and triggers the selection state automatically.
- **Fast Traversal**: Rapidly swiping the pointer across the board never triggers an accidental selection, as the timer cleanly resets on each boundary crossing.
- **Continuous Swap**: After a piece is selected, hovering a new piece instantly displays the blue swap preview. Pinching successfully confirms the swap.
- **Mouse Drag**: Mouse interactions correctly ignore the timer and maintain standard drag-and-drop mechanics.

## Known Limitations
None.

## Next Sprint Prerequisites
None.
