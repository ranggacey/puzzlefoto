# Sprint 5.2 — Puzzle Generation Engine

**Status**: Completed

## Objective
Implement the first version of the Puzzle Engine while strictly following the Architecture Specification. The engine generates puzzle pieces from a source image and renders them in a pure presentation component, leaving the single source of truth entirely in the Zustand store.

## Scope
- Define the canonical `PuzzlePiece` interface and `PuzzleDifficulty` constants.
- Create a pure `PuzzleGenerator` service that calculates deterministic piece crop metadata and positions.
- Extend `PuzzleStore` to hold the puzzle state and generation actions.
- Build the `PuzzleBoard` and `PuzzlePiece` pure presentation components.
- Update `PuzzleExperience` to transition to gameplay automatically after calibration.

## Architecture Decisions
- **Puzzle Generator is Pure**: The `PuzzleGenerator` service takes a `CapturedPhoto` and returns `PuzzlePiece[]`. It never accesses React, Zustand, or the DOM.
- **Puzzle Board as Renderer**: `PuzzleBoard` only renders puzzle pieces passed via props. It has no generation or gameplay logic.
- **Puzzle Store as Single Source of Truth**: The generated array of `PuzzlePiece` is saved in the Zustand store, ensuring all rendering components read from the same state.
- **CSS Sprite Rendering**: The `PuzzlePiece` component renders the original image using CSS `background-position` and percentages, which naturally scales to the container without requiring intermediate crop images.
- **Generator Determinism**: `PuzzleGenerator` accepts an injectable `random` function to allow for deterministic layouts.

## Files Created
- `src/features/puzzle/types/puzzle-piece.ts`
- `src/features/puzzle/constants/puzzle-difficulty.ts`
- `src/features/puzzle/services/puzzle-generator.ts`
- `src/features/puzzle/components/puzzle-board.tsx`
- `src/features/puzzle/components/puzzle-piece.tsx`
- `docs/SPRINTS/sprint-5.2.md`

## Files Modified
- `src/types/index.ts` (removed obsolete types)
- `src/store/puzzle-store.ts` (added generatePuzzle and gameplay state)
- `src/features/puzzle/components/puzzle-experience.tsx` (orchestration updates)
- `docs/CHANGELOG.md`

## State Ownership
- `usePuzzleStore` completely owns the canonical `pieces` array.

## Public APIs
- The Puzzle module now internally uses `PuzzleGenerator` and `PuzzleBoard`, but the global public API (`PuzzleExperience`) remains unchanged.

## Verification Results
- Automatic background segmentation successfully captured and completed.
- Calibration sequence successfully faked/completed, transitioning perfectly to Gameplay.
- Live camera feed remains uninterrupted and visible behind the puzzle board.
- Puzzle pieces correctly render the cropped transparent PNG using absolute percentage positioning.
- Linting, TypeScript compilation, and Production Build passed successfully.

## Known Limitations & Out-of-Scope
- Dragging, snapping, and collision detection.
- Win conditions and scoring.
- Hand tracking integration.

## Next Sprint Prerequisites
- None. Ready for Sprint 5.3 / Puzzle Interactions.
