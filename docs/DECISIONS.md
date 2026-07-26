# Architectural Decision Log

This document records the major architectural decisions made during the development of Vision Puzzle. Future architectural decisions should be appended here.

---

## 1. Camera Engine Isolation
**Decision**: `CameraProvider` owns the MediaStream lifecycle. `CameraService` is a pure browser wrapper.
**Reasoning**: Prevents duplicate video streams and camera access collisions. Decouples the React lifecycle from the browser `navigator.mediaDevices` API.

## 2. Background Studio Decoupling
**Decision**: Background Studio consumes finalized `CapturedPhoto` objects rather than directly accessing the live camera stream.
**Reasoning**: Keeps the Camera Engine strictly isolated. Background processing can happen asynchronously without blocking the camera frame rate.

## 3. Lazy Loading AI Models
**Decision**: Heavy AI libraries (like `@mediapipe/tasks-vision`) must be lazy loaded via `next/dynamic` or dynamic imports.
**Reasoning**: Preserves the performance of the Landing page and core photo booth UI. The models are massive and should only be downloaded when the user enters an AI-specific route.

## 4. Fullscreen Layout Standardization
**Decision**: No immersive fullscreen feature may implement its own safe-area calculation or top navigation. All must use the shared `<FullscreenLayout>` shell.
**Reasoning**: Prevents UI collisions with the global Navbar, enforces consistent floating action spacing, and eliminates magic numbers (`top-20`, etc.).

## 5. Animation Strategy
**Decision**: The Landing page relies on standard CSS and `framer-motion` for complex sequences (like the Puzzle Hero) instead of WebGL/Canvas.
**Reasoning**: Minimizes initial bundle size and complexity. WebGL is reserved exclusively for the actual gameplay (Sprint 5+).
