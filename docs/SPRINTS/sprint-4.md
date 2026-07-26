# Sprint 4 — Background Studio (AI Segmentation)

## Objective
Introduce AI-powered background removal to allow users to customize their captured photos with solid colors, gradients, or transparency before generating the puzzle.

## Scope
- Integrate `@mediapipe/tasks-vision` for Selfie Segmentation.
- Implement a real-time mask generation and Canvas compositor pipeline.
- Build the Background Studio UI for selecting background styles.
- Manage Background Configuration state via Zustand.
- *Out of Scope*: Puzzle generation, Hand tracking, Export/Sharing features.

## Architecture Impact
- **Feature Isolation**: The Background Studio was strictly implemented as an independent feature. It consumes completed photos from `camera-store.ts` and outputs processed photos, ensuring zero interference with the live Camera Engine.
- **Lazy ML Loading**: The MediaPipe Vision tasks are lazily loaded (`next/dynamic` with `ssr: false`) to completely prevent ML bundle bloat on the landing page.

## Implementation Summary
The Background Studio successfully removes photo backgrounds instantly using MediaPipe. To ensure robust mobile performance, the segmentation mask is cached as a `Uint8ClampedArray` immediately after a single inference pass. The `CompositorService` then uses this cached mask to compose the foreground over any dynamically selected background on a Canvas element, updating on-demand rather than running continuous inference.

## Major Decisions
1. **Single-Inference Caching**: Decided to run the ML model exactly once per photo and cache the resulting alpha mask array. Re-running segmentation on every background color change would have destroyed mobile battery life.
2. **BackgroundConfig Interface**: Created a dedicated `BackgroundConfig` object to abstract background styles (transparent, solid, gradient) rather than storing multiple base64 strings in memory, significantly reducing memory bloat.

## Verification
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- Manual testing performed (Verified background removal accuracy, transparent export, and memory usage during rapid background swapping).

## Known Issues
None.

## Lessons Learned
Browser memory management becomes critical when dealing with multiple high-resolution base64 images. Relying on lightweight configuration objects (`BackgroundConfig`) and on-the-fly Canvas composition is far more efficient than persisting multiple duplicated image strings in a global store.

## Next Sprint
**Sprint 4.1 — Layout Architecture Standardization**: A minor refactoring phase to solve `Navbar` overlaps and introduce a unified `FullscreenLayout` primitive across all immersive screens.
