# Sprint 5.0 — Puzzle Experience Foundation

## Objective
Establish the foundation for the Puzzle Experience (`/puzzle` route) by migrating to a feature-specific camera architecture and preparing the UI for gameplay components.

## Implementation Details

### Architecture Refinements
- Extracted `CameraService` to `src/services/` to act as a shared infrastructure singleton.
- Migrated the global `CameraProvider` to `src/features/photo-booth/providers/photo-booth-camera-provider.tsx`.
- Updated all hooks to be feature-specific (e.g., `usePhotoBoothCamera`, `usePuzzleCamera`).

### Puzzle Experience
- Created `PuzzleCameraProvider` to manage the live preview and future hand-tracking lifecycles independently.
- Introduced `app/puzzle/layout.tsx` to wrap the route with the new provider.
- Updated `app/puzzle/page.tsx` to handle route redirects dynamically if no `processedPhotos` exist in the Zustand store.
- Created `PuzzleExperience` as the pure UI orchestrator.
- Created `LiveBackground` which consumes the mirrored camera stream.
- Created `PuzzleStage` to serve as a future gameplay extension point.
- Created `FloatingPhoto` to gently animate the user's finalized image in the center.
- Created `CalibrationOverlay` to act as a placeholder for the future MediaPipe hand tracking onboarding.

## Decisions Made
- **Feature-Specific Providers**: Adopted the rule that `CameraService` handles browser access while each feature owns its MediaStream lifecycle.
- **Route-Level Redirection**: Redirect logic belongs to the route (`page.tsx`), keeping `PuzzleExperience` pure and testable.

## Next Steps
- Sprint 5.1: Puzzle Generation (Canvas image slicing).
