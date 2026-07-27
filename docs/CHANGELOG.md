# Changelog

All notable changes to the Vision Puzzle project will be documented in this file.

---

## [Sprint 5.8.1] - Gameplay Interaction Redesign (Select & Swap)
- **New Feature**: Migrated Hand Tracking puzzle gameplay from drag-and-drop to a discrete "Select & Swap" interaction model, drastically improving usability and stability under webcam tracking.
- **Enhancement**: Introduced explicit visual anchors (small center dots) on unlocked puzzle pieces that respond to hover, selection, and swap preview states.
- **Enhancement**: Added a dedicated `handlePieceSelection` action in `PuzzleStore` to cleanly process selection state and execute swaps, isolating gameplay logic from the presentation layer.
- **Enhancement**: Configured `useUnifiedDrag` to ignore Hand Tracking sources, ensuring that Mouse users can seamlessly continue using classic drag-and-drop mechanics.
- **Enhancement**: Programmed `PuzzleStore` to automatically clear active selections upon any major state transition (e.g., retake photo, restart, or difficulty change).

## [Sprint 5.8] - End-to-End Hand Interaction
- **New Feature**: Re-architected Hand Tracking into a complete application-wide unified input system.
- **New Feature**: Added `GlobalPointerProvider` to gracefully unify Mouse and Hand Tracking streams.
- **New Feature**: Created `InteractionDispatcher` acting as an interaction router, invoking callbacks on explicitly registered UI elements rather than generating synthetic DOM events.
- **Enhancement**: Introduced `<InteractionSurface>` to standard UI overlays (Difficulty Selection, Capture, Puzzle Completed) to add identical magnetic attraction, hover glow, and ripple feedback, regardless of physical device used.
- **Enhancement**: Modified `useUnifiedDrag` to read from the unified `pointerState` rather than listening to window pointer events.
- **Enhancement**: Refactored `PuzzleBoard` to act as a registered interaction surface.
- **Enhancement**: Configured conditional rendering for `PointerOverlay` so that the custom AR pointer is completely hidden when the user interacts using a mouse.

## [Sprint 5.7] - AR-Style Interaction Layer
- **New Feature**: Introduced `InteractionAssistService` to act as a dedicated AR interaction layer decoupling hand-tracking from Puzzle Engine.
- **Enhancement**: Pointer position calculates from the midpoint between thumb and index finger during a pinch for natural grabbing.
- **Enhancement**: Implemented progressive magnetic attraction to gracefully pull the pointer towards candidate pieces based on distance.
- **Enhancement**: Smart piece selection uses an 80px interaction radius and hover hysteresis for extreme stability.
- **Enhancement**: Added an adaptive snap drop radius of 40px to assist piece placement.
- **Enhancement**: `PointerOverlay` updated with idle, hover, and grab visual states, including a new dashed AR connection line to the locked target.
- **Enhancement**: `PuzzlePiece` now uses a softer Framer Motion spring configuration during drags to simulate a physical `followStrength`.

---

## [Sprint 5.6.2] - Hand Tracking Stability Refinement
- Implemented **Adaptive Pointer Smoothing** in `PointerSmoothing`, applying dynamic easing (`alpha` between `0.45` and `0.82`) based on cursor velocity to eliminate aiming tremor while maintaining responsiveness.
- Added `HandTrackingConfidenceFilter` to intercept raw MediaPipe outputs and discard impossible coordinate jumps (spikes) before they disrupt the pointer.
- Upgraded the pinch release logic in `GestureRecognizer` with a `300ms` **Release Confirmation Window**, creating a **Sticky Grab** state that prevents accidental drops during continuous pinching.
- Enhanced `PointerOverlay` with stronger magnetic assistance (`85%`) specifically applied while holding a piece, making exact slot placement completely effortless.
- Introduced a realtime **Slot Preview** directly on the `PuzzleBoard`, which highlights the hovered destination slot to give users clear drop-zone feedback.
- Tweaked `PuzzlePiece` invalid release handling to use a gentler animation transition (`stiffness: 300, damping: 20`) for a soft bounce-back instead of an immediate rigid snap.

## [Sprint 5.6.1] - Hand Tracking Interaction Refinement
- Abstracted tracking and visual variables into a dedicated `InteractionConfig`.
- Added Tracking Persistence (`180ms`) in `HandTrackingProvider` to prevent single-frame flickering when tracking is briefly lost.
- Upgraded `GestureRecognizer` to use Pinch Hysteresis for maximum grab stability, completely eliminating rapid pinch/unpinch oscillation.
- Introduced Temporary Grab Persistence (`200ms`) inside `GestureRecognizer` to survive short occlusions while dragging pieces.
- Expanded the effective hover detection margin in `PuzzleBoard` to `48px`, making hover-locking significantly more forgiving.
- Enhanced `PointerOverlay` with smoother animation curves, dynamic cursor sizing (`24px`, `34px`, `40px`), and a stronger `75%` magnetic pull.
- Offloaded the visually dragged piece via a `+30px` Y-axis offset so the user's hand/finger does not occlude the piece they are dragging.

## [Sprint 5.6] - Gesture Recognition & Hand-Controlled Interaction
- Developed a decoupled `GestureRecognizer` interpreting AI hand landmarks into stable, debounced pinch and hover events.
- Refactored `PuzzleBoard` and `PuzzlePiece` with a newly created `useUnifiedDrag` hook, establishing a unified input pipeline where synthetic AI gestures and native mouse events seamlessly coexist.
- Implemented presentation-layer Magnetic Hover Assistance within `PointerOverlay`, smoothly easing the cursor toward valid pieces.
- Added visual states mapping to AI gestures including hover enlargement, grab enlargement, and drop ripple effects without polling the PuzzleEngine state directly.

## [Sprint 5.5] - Hand Tracking Foundation
- Integrated MediaPipe Tasks Vision (`@mediapipe/tasks-vision`) to run hand tracking inference.
- Created `HandTrackingProvider` to intercept the existing `PuzzleCameraProvider` MediaStream and execute an unblocking `requestAnimationFrame` loop.
- Defined a canonical, decoupled `HandState` interface and established a `PointerSmoothing` system via EMA.
- Developed the `PointerOverlay` presentation layer, visualizing hand coordinates with a smooth trail, decoupled entirely from the core Puzzle Engine.

## [Sprint 5.4] - Victory Experience & Session Flow
- Implemented a delayed, decoupled victory presentation state without polluting the underlying gameplay mechanics.
- Finalized visual hierarchy for locked puzzle pieces (full opacity, no border, subtle glow) combined with a unified board scale-up animation.
- Created `PuzzleCompletedOverlay` rendering post-game statistics (Difficulty, Moves, Time) and session controls.
- Integrated `Play Again`, `New Photo`, and `Back to Home` actions while strictly preserving `PuzzleCameraProvider` MediaStream lifetimes.

## [Sprint 5.3.1] - Drag Cancellation & Swap Validation
- Enforced strict grid alignment by treating drag transforms as temporary visual offsets (`dragSnapToOrigin=true`).
- Ensured invalid interactions (dropping outside board, dropping on locked pieces) smoothly animate pieces back to their original slots.
- Reinforced the architecture rule that PuzzleStore completely owns piece position; components merely render slot indices.

## [Sprint 5.3] - Slot-Based Grid Drag Implementation
- Migrated puzzle physics to a Slot-Based Gameplay architecture. Pieces track their current and correct slot indices rather than arbitrary spatial coordinates.
- Implemented `movePieceToSlot` within `PuzzleStore` to centralize drag swaps, locks, and condition checks.
- Enabled grid-locked dragging using Framer Motion on the puzzle pieces, disabling pointer events entirely on locked pieces.
- Added a placeholder UI element for the `"completed"` scene, laying out state paths for Sprint 5.4 win effects.

## [Sprint 5.2.2] - Puzzle Visual Refinement
- Removed background segmentation from the Puzzle Image Pipeline to simplify architecture and eliminate preprocessing latency.
- Updated `ARCHITECTURE_FREEZE.md` to reflect distinct, decoupled image pipelines for Photo Booth and Puzzle Experience.
- Applied semi-transparent visual treatment (80% opacity, subtle outlines, soft shadows) to puzzle pieces for improved gameplay readability over the live camera.
- Pre-defined `idle`, `active`, and `locked` Framer Motion animation variants in `PuzzlePiece` to prepare a robust foundation for Sprint 5.3 interactions.

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
