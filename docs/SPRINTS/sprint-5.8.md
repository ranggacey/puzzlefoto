# Sprint 5.8 — End-to-End Hand Interaction

## Objective
Transform Hand Tracking into a complete application-wide input method capable of replacing the mouse throughout the entire Puzzle Experience. This completes the AI Input architecture by introducing a unified interaction layer that treats Mouse, Touch, and Hand Tracking as equivalent pointer sources.

## Scope
- Re-architected Hand Tracking from a Puzzle-only feature into an application-wide input system.
- Created `GlobalPointerProvider` to unify Mouse and Hand Tracking interactions globally.
- Implemented `InteractionDispatcher` as an interaction router based on a target registry.
- Developed the `<InteractionSurface>` wrapper for shared UI elements (Buttons, Overlays) for a seamless AR experience.
- Refactored `PuzzleBoard` to utilize global pointer state and act as a first-class registered surface.

## Architecture Decisions
1. **Interaction Router over Synthetic Events:** Decided against synthesizing native DOM pointer events (`pointerover`, `click`) in favor of an explicit Surface Registry. `InteractionDispatcher` matches hand gestures to registered UI elements (`InteractionSurface`) and triggers callbacks directly. This guarantees deterministic behavior and keeps browser native functionality predictable.
2. **Global Pointer Unification:** Both Mouse and Hand input sources converge into `GlobalPointerProvider`. UI components strictly read from this provider.
3. **Selective Cursor Presentation:** The custom AR pointer only renders when Hand Tracking is active. The OS mouse cursor remains visible and unaffected when the user returns to physical interaction.

## Files Created
- `src/features/hand-tracking/providers/global-pointer-provider.tsx`
- `src/features/hand-tracking/components/interaction-surface.tsx`
- `src/features/hand-tracking/services/interaction-dispatcher.tsx`

## Files Modified
- `src/features/puzzle/components/puzzle-experience.tsx`
- `src/features/puzzle/components/capture-overlay.tsx`
- `src/features/puzzle/components/difficulty-selection-overlay.tsx`
- `src/features/puzzle/components/puzzle-completed-overlay.tsx`
- `src/features/puzzle/components/puzzle-board.tsx`
- `src/features/puzzle/hooks/use-unified-drag.ts`
- `src/features/hand-tracking/components/pointer-overlay.tsx`

## State Ownership
- **Global Pointer (`GlobalPointerProvider`)**: Owns unified pointer position (`x`, `y`), `phase`, and active `source`.
- **Interaction Logic (`InteractionDispatcher`)**: Owns hit-testing resolution, priority ordering, and callback dispatching for hand tracking.
- **Visuals (`InteractionSurface`)**: Each surface manages its own visual transitions (glow, scale, ripple) based on callbacks triggered by the dispatcher.

## Verification Results
- **Mouse + Hand Handover**: Switching between mouse and hand tracking behaves flawlessly, accurately hiding/displaying the correct cursor.
- **Overlay Prioritization**: Registered overlay surfaces successfully intercept interactions before the puzzle board receives them.
- **Gameplay Isolation**: While dragging a puzzle piece, the InteractionDispatcher maintains its active target lock, preventing unintended UI interaction in the background.

## Known Limitations
- The camera must be actively running for Hand Tracking to control the pointer. If the tracking pipeline drops completely, the application successfully falls back to the native mouse.

## Next Sprint Prerequisites
- None. This completes the Hand Tracking input architecture.
