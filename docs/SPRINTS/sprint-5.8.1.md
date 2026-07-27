# Sprint 5.8.1 — Gameplay Interaction Redesign (Select & Swap)

## Objective
Redesign the puzzle gameplay interaction model based on real-world usability testing. Continuous dragging was replaced with a discrete **Select & Swap** model for Hand Tracking, significantly reducing the dependency on perfectly stable tracking while preserving the existing Puzzle Engine and Mouse drag-and-drop gameplay.

## Scope
- Migrated Hand Tracking puzzle gameplay from drag-and-drop to Select & Swap.
- Introduced interactive visual anchors (small circles) centered on unlocked puzzle pieces.
- Added visual states for pieces (Idle, Hover, Selected, Swap Target).
- Automated selection cancellation upon scene transitions (Play Again, New Photo, Difficulty Changes).

## Architecture Decisions
1. **Centralized Selection State**: Utilized the pre-existing `selectedPieceId` within `PuzzleStore` to manage selection. 
2. **Abstract Store Action**: Added `handlePieceSelection(pieceId)` to `PuzzleStore`, removing selection logic from `PuzzleBoard` and encapsulating selection, deselection, and swapping directly within the store.
3. **Decoupled Input Behaviors**: Hand Tracking routes pinches to `handlePieceSelection`, while Mouse/Touch interactions continue to trigger `useUnifiedDrag`. Both interaction methods invoke the same underlying store actions (`movePieceToSlot`), ensuring unified gameplay rules.

## Files Modified
- `src/features/puzzle/components/puzzle-board.tsx`
- `src/features/puzzle/components/puzzle-piece.tsx`
- `src/features/puzzle/hooks/use-unified-drag.ts`
- `src/store/puzzle-store.ts`

## Verification Results
- **Mouse Drag-and-Drop**: Functions smoothly without interference from the new state variables.
- **Hand Tracking Select & Swap**: Successfully isolates pinches, selects pieces (highlighted green with filled anchor), and swaps targets upon secondary selection (previewed with pulsing blue highlight).
- **Invalid Actions Ignored**: Attempting to select a locked piece or swap a locked piece fails gracefully. Selecting an already selected piece clears the selection.
- **State Reset**: Retaking a photo or restarting immediately clears the active selection.

## Known Limitations
None.

## Next Sprint Prerequisites
None.
