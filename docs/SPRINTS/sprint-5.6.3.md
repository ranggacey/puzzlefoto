# Sprint 5.6.3 — Hand Tracking Diagnostics & Adaptive Performance

**Status**: Completed

## Objective
Introduce a comprehensive diagnostics layer for the Hand Tracking system to better understand real-world performance across different devices. This sprint focuses purely on visibility and does not change gameplay mechanics.

## Scope
- **Camera Settings**: Updated `DEFAULT_CAMERA_CONSTRAINTS` to request 60 FPS by default. Added extraction of actual active Camera stream settings (resolution, framerate, device ID) in `HandTrackingProvider`.
- **Inference FPS**: Added an `FpsTracker` around the MediaPipe `detectForVideo` call inside the `requestAnimationFrame` loop in `HandTrackingProvider` to measure true inference performance.
- **Render FPS**: Added an `FpsTracker` to `PointerOverlay` to track the actual React rendering and UI thread capability.
- **Diagnostic Store**: Created a dedicated Zustand store (`hand-tracking-diagnostics-store.ts`) separating performance telemetry from interaction state.
- **Tracking Statistics**: Implemented `TrackingDiagnosticsService` to compute running averages of confidence, record tracking losses, measure recovery durations, and track gesture usage (pinches, grabs, releases).
- **Event Logger**: The diagnostics store now maintains a rolling timeline of the last 100 interaction events with formatted timestamps.
- **Debug Overlay**: Created `HandTrackingDebugOverlay`, a highly detailed, collapsible HUD displaying real-time FPS, metrics, and logs. It can be toggled via the `NEXT_PUBLIC_HAND_DEBUG=true` environment variable or by adding `?debugHandTracking=true` to the URL.

## Architecture Decisions
- No core architecture changes were made. The diagnostics system simply reads from existing systems without impacting them.
- All diagnostics data is decoupled from the main puzzle or camera stores, preventing heavy diagnostics telemetry from causing unwanted game-state re-renders.

## Files Created
- `src/features/hand-tracking/store/hand-tracking-diagnostics-store.ts`
- `src/features/hand-tracking/services/fps-tracker.ts`
- `src/features/hand-tracking/services/diagnostics-service.ts`
- `src/features/hand-tracking/components/debug-overlay.tsx`
- `docs/SPRINTS/sprint-5.6.3.md`

## Files Modified
- `src/features/photo-booth/constants/camera.ts`
- `src/features/hand-tracking/providers/hand-tracking-provider.tsx`
- `src/features/hand-tracking/components/pointer-overlay.tsx`
- `src/features/hand-tracking/services/gesture-recognizer.ts`
- `src/features/puzzle/components/puzzle-experience.tsx`
- `docs/CHANGELOG.md`

## Verification Results
- **Camera FPS**: correctly queries and defaults to requesting 60 fps.
- **MediaPipe FPS**: Inference loops log processing times independently of render.
- **Overlay**: Render FPS approximates display refresh rate and toggles cleanly without causing visual glitching.
- **Tracking**: Recoveries and confidence are accurately recorded. Events continuously log over time.
