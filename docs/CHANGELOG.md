# Changelog

All notable changes to the Vision Puzzle project will be documented in this file.

---

## [Sprint 5.2.1] - Gameplay Entry Flow Refinement
- Inserted `difficulty-selection` overlay into the Puzzle Experience orchestration.
- Prevented automatic puzzle generation, ensuring generation only fires upon explicit confirmation.
- Enabled native Retake flow leveraging the existing store `reset()` while strictly preserving camera lifecycle.
- Refined the Puzzle Board to use a responsive, centered landscape layout that respects safe areas.
- Guaranteed visual transparency of puzzle pieces by adopting `filter: drop-shadow(...)` instead of opaque box models.

## [Sprint 5.2] - Puzzle Generation Engine
- Defined the canonical `PuzzlePiece` interface and `PuzzleDifficulty` constants.
- Created a pure `PuzzleGenerator` service for deterministic puzzle layout calculation.
- Extended `PuzzleStore` to act as the single source of truth for the gameplay state machine and piece positions.
- Built the `PuzzleBoard` and `PuzzlePiece` rendering components using CSS Sprite techniques for automatic scaling.
- Updated `PuzzleExperience` to naturally transition to gameplay after the calibration scene.

## [Sprint 5.1 Hotfix] - Continuous Puzzle Camera Lifecycle
- Fixed camera restarting issues during the puzzle capture flow.
- Refactored `PuzzleCameraProvider` to correctly own and memoize the camera lifecycle.
- Removed lifecycle control from `LiveBackground`.

## [Sprint 5.1] - Puzzle Capture Experience
- Reorganized `CaptureService` as a shared infrastructure layer.
- Implemented the continuous camera capture and image processing pipeline.
- Added `CaptureOverlay`, `FloatingPhoto`, and `CalibrationOverlay` to orchestrate the scene progression.

## [Sprint 5.0.1] - Remove Legacy Puzzle Redirect
- Aligned architecture to make Puzzle an independent experience.
- Removed legacy redirect logic from `/puzzle` that depended on Photo Booth's `processedPhotos`.
- The `/puzzle` route is now always accessible directly.

## [Sprint 5.0] - Puzzle Experience Foundation
- Extracted `CameraService` to a shared infrastructure layer.
- Implemented feature-specific camera providers (`PhotoBoothCameraProvider`, `PuzzleCameraProvider`) to prevent God Objects.
- Built the `/puzzle` route with automatic redirection if photos are missing.
- Implemented `PuzzleExperience` orchestrator featuring `LiveBackground`, `PuzzleStage`, `FloatingPhoto`, and `CalibrationOverlay`.

## [Sprint 4.5] - Landing Experience Redesign
- Repositioned the Landing page to focus on Vision Puzzle as the primary product.
- Introduced a CSS/Framer Motion-powered puzzle cracking animation for the Hero section.
- Moved the Photo Booth to a secondary supporting feature section.
- Updated the "How It Works" user journey steps.
- Decoupled animation logic from layout logic for easier replacement in Sprint 5.

## [Sprint 4.1] - Layout Architecture Standardization
- Created a universal `LAYOUT` token configuration in `src/constants/layout.ts`.
- Introduced `<FullscreenLayout>` to strictly manage safe-areas for all immersive features.
- Purged all hardcoded layout magic numbers across Photo Stage, Result Preview, and Background Studio.

## [Sprint 4] - Background Studio (AI Segmentation)
- Integrated `@mediapipe/tasks-vision` selfie segmentation.
- Implemented real-time background removal pipeline using Web Workers and Canvas composition.
- Built the `BackgroundStudio` UI allowing users to apply custom colors, gradients, and original backgrounds.
- Ensured complete isolation of the Background Studio from the core Camera Engine.

## [Sprint 3.5] - Architecture Cleanup
- Conducted a comprehensive audit of the codebase.
- Removed dead code, unused shadcn primitives, and legacy placeholder logic.
- Standardized file naming conventions across all features.
- Formalized public APIs for features via `index.ts` barrel exports.
- Frozen the foundational architecture via `ARCHITECTURE_FREEZE.md`.

## [Sprint 3] - Camera Engine
- Built a highly robust, headless `CameraProvider` context to manage `navigator.mediaDevices`.
- Created `CameraService` to abstract browser hardware interactions.
- Created `CaptureService` to handle taking snapshots from a video stream via Canvas.
- Built the `PhotoStage` UI with dynamic capture modes (Single, Film Strip, Grid).
