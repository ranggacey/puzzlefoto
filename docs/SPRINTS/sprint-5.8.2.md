# Sprint 5.8.2 — Deterministic Piece Selection

## Objective
Refine the Select & Swap gameplay introduced in Sprint 5.8.1 by replacing intent-based selection with deterministic piece hit testing. This sprint simplifies the interaction model by removing continuous dragging assumptions (such as magnetic targeting and nearest-piece selection) and makes piece selection predictable: if the pointer is strictly inside the rendered bounds of a piece, that piece becomes the interaction candidate.

## Scope
- Replaced magnetic targeting and nearest-piece selection with bounding-box hit testing.
- Bound hover stability tracking to specific puzzle pieces rather than just the pointer.
- Cleaned up obsolete helper methods from `InteractionAssistService`.
- Registered `PuzzlePiece`s as dynamic target elements within the hit testing engine.

## Architecture Decisions
1. **Rendered Bounding Box Hits**: The `InteractionAssistService` now manages a registry of target elements (the unlocked puzzle pieces) and uses `.getBoundingClientRect()` to evaluate precise hit testing based on the user's actual rendered view, not grid coordinates.
2. **Piece-Specific Stability Timer**: The 100ms hover debounce timer now maps directly to the active candidate piece's ID. Leaving a piece instantly invalidates the timer, ensuring precise handling when jumping between adjacent targets.
3. **Decoupled Assistance**: Gameplay-specific interactions have been stripped out of the core assist service, making it more generic and maintainable for future extensions.

## Files Modified
- `src/features/hand-tracking/services/interaction-assist.ts`
- `src/features/puzzle/components/puzzle-piece.tsx`
- `src/features/puzzle/components/puzzle-board.tsx`

## Verification Results
- **Bounding Box Hit Test**: Moving the pointer strictly inside a piece reliably activates selection; no center-point magnetism interferes.
- **Adjacent Selection**: Hovering adjacent pieces cleanly transitions states without flicker.
- **Responsive Layout**: Adjusting the window size correctly maintains hit accuracy due to the switch to live DOM `getBoundingClientRect()` checks.
- **Mouse Compatibility**: Drag-and-drop gameplay remains completely unaffected and fully operational.

## Known Limitations
None.

## Next Sprint Prerequisites
None.
