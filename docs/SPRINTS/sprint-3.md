# Sprint 3 — Camera Engine & Photo Booth

## Objective
Establish the foundational Camera Engine and build the interactive Photo Booth UI to allow users to capture photos directly from their webcam.

## Scope
- Implement a headless state machine for managing webcam access.
- Build the live camera preview UI.
- Implement robust capture modes (Single, Film Strip, Grid).
- Freeze camera frames into standardized image data (Canvas extraction).
- *Out of Scope*: AI processing, Background replacement, Image enhancement.

## Architecture Impact
- **Decoupled Architecture**: Created a strictly headless `CameraProvider` context to separate browser `navigator.mediaDevices` stream lifecycles from React rendering.
- **Service Layer**: Introduced `CameraService` (hardware APIs) and `CaptureService` (Canvas snapshots) as pure TypeScript singletons to isolate DOM manipulations.
- **State Ownership**: Zustand (`camera-store.ts`) strictly owns the `capturedPhotos` state to be easily handed off to future Sprints.

## Implementation Summary
The core camera pipeline was successfully established. `CameraProvider` safely requests user permissions, caches the active `MediaStream`, and passes it to the live `<video>` feed. Users can select between three capture modes. `CaptureService` flawlessly freezes the `<video>` stream onto an offscreen Canvas, exporting it as base64 images that are saved sequentially to the Zustand store.

## Major Decisions
1. **CameraProvider owns MediaStream**: The React context is explicitly responsible for managing the active stream reference rather than the UI components. This prevents memory leaks and ensures only one active camera stream exists at a time.
2. **Pure Service Abstractions**: DOM logic (e.g., Canvas `toDataURL()`) was deliberately moved out of React components into `CaptureService` so components remain pure and testable.

## Verification
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- Manual testing performed (Verified camera permissions, fallback UI for denied access, successful capture extraction across all modes).

## Known Issues
None.

## Lessons Learned
Browser `MediaDevices` APIs behave inconsistently across platforms (especially iOS Safari). Decoupling the stream acquisition into a centralized service (`CameraService`) proved invaluable for providing stable access and minimizing race conditions.

## Next Sprint
**Sprint 3.5 — Architecture Cleanup & Refactor**: A transitional sprint to scrub dead code, formalize barrel exports, and officially freeze the architectural contract before introducing heavy ML libraries.
