# Vision Puzzle — Architecture Freeze (Post Sprint 3.5)

This document defines the architectural contract for Vision Puzzle. All future development, including Sprints 4-6, must adhere to these guidelines to ensure the project remains scalable, maintainable, and highly performant.

---

## 1. High-Level Architecture

The application is structured into clearly delineated top-level domains:

- **Landing Module**: The public-facing introduction to the product. Completely isolated from heavy interactive modules.
- **Photo Booth Module**: The entry point for the core experience. Handles mode selection and transitions users to the camera flow.
- **Camera Engine**: A robust, headless state machine and API abstraction layer over the browser's `navigator.mediaDevices` and hardware.
- **Background Studio (Sprint 4)**: Responsible for AI-driven background removal (MediaPipe Selfiesegmentation) and photo customization.
- **Puzzle Engine (Sprint 5)**: Responsible for rendering, shuffling, and validating the state of the jigsaw puzzle game on the Canvas.
- **Hand Tracking (Sprint 6)**: An entirely decoupled AI input layer (MediaPipe Hand Tracking) that dispatches standardized coordinate events to the Puzzle Engine.

---

## 2. Folder Responsibilities

The codebase follows a strictly organized structure to enforce boundary separation.

- **`app/`**: Next.js App Router definitions. Contains only static UI layouts and route definitions. Must NOT contain business logic.
- **`components/`**: 
  - `ui/`: Stateless, generic design system primitives (shadcn/ui).
  - `layout/`: Global layouts (Navbar, Footer).
  - `shared/`: Generic components used across multiple features (e.g. `ThemeToggle`, `TechBadge`).
- **`features/`**: The core application domains (e.g., `photo-booth`, `puzzle`, `hand-tracking`). Features must be deeply isolated.
- **`hooks/`**: Global React hooks (`use-media-query`, etc.). Feature-specific hooks belong in `features/[feature]/hooks`.
- **`services/`**: Global service singletons. Feature-specific services belong in `features/[feature]/services`.
- **`store/`**: Global Zustand state stores defining the single sources of truth.
- **`constants/`**: Immutable configuration data (e.g., tech stack, roadmap, site config).
- **`lib/`**: Generic utilities, animations, and helper functions (e.g., `utils.ts`, `animations.ts`).
- **`types/`**: Global TypeScript definitions. Feature-specific types belong in `features/[feature]/types`.

---

## 3. Dependency Rules

To prevent accidental coupling, strictly enforce the following dependency boundaries:

- **Landing Isolation**: The Landing route (`/`) must **never** import internals from `Photo Booth`, `Camera Engine`, or AI modules.
- **Camera Engine Encapsulation**: `Puzzle Engine` and `Background Studio` must **never** directly access `CameraService` or DOM video streams. They must consume the finalized `CapturedPhoto` objects provided by the Photo Booth flow.
- **Input Decoupling**: `Hand Tracking` must **never** directly manipulate `Puzzle Engine` state. It must dispatch standardized coordinate/gesture events that the `Puzzle Engine` listens to.
- **Feature Isolation**: Features must **never** import deep implementation details from other features (e.g. `import { Something } from "@/features/other/components/deep-file"`). They should only import from a feature's public API barrel (`index.ts`).

---

## 4. Public APIs

Features expose a minimalistic public API. Everything not explicitly exported is a private internal implementation.

**Photo Booth Public API:**
- `CameraProvider`: The Context wrapper.
- `useCamera()`: The React consumer hook.
- `CaptureMode`, `CaptureModeConfig`, `CapturedPhoto`: Essential data types.
- `ResultPreview`: UI for reviewing captures.
- `PhotoBoothPage`: The routed view.

**Puzzle Engine Public API (Planned):**
- `PuzzleStage`: The primary game board component.
- `usePuzzle()`: Hook for querying game state.
- `PuzzleConfig`: Configuration interface.

**Hand Tracking Public API (Planned):**
- `HandTrackingProvider`: The tracker lifecycle manager.
- `useHandTracking()`: Hook returning normalized coordinates.

---

## 5. Module Ownership & Responsibilities

Responsibilities are strictly assigned to single owners. **No responsibility should belong to two modules simultaneously.**

**Camera Engine Roles:**
- **`CameraProvider`** OWNS the MediaStream lifecycle, the active stream reference, permission status, and state machine transitions.
- **`CameraService`** OWNS all interactions with the browser's `MediaDevices` API (`getUserMedia`, `enumerateDevices`). It does NOT maintain lifecycle state.
- **`CaptureService`** OWNS the Canvas DOM manipulation required to freeze a video frame into a base64 string or Blob.
- **`FullscreenService`** OWNS standardizing browser-specific fullscreen APIs.

---

## 6. State Ownership

Every major piece of state has exactly one source of truth.

- **Camera Lifecycle State**: Owned by `CameraProvider` (React Context) due to its tight coupling with the DOM stream lifecycle.
- **Capture Store (`camera-store.ts`)**: Owned by Zustand. Stores the currently selected mode and the array of captured photos.
- **Puzzle State (`puzzle-store.ts`)**: Owned by Zustand. Manages piece locations, win states, and difficulty settings.
- **Hand Tracking State (`hand-tracking-store.ts`)**: Owned by Zustand. Dispatches real-time normalized cursor coordinates and detected gestures.
- **UI State (`ui-store.ts`)**: Owned by Zustand. Controls global transient UI states like modals or sidebars (if implemented).

---

## 7. Design System Rules

Future UI additions must strictly adhere to the established design language to preserve the premium aesthetic:

- **Spacing & Layout**: Utilize Tailwind's standard scales. Use `Container` and `Section` wrappers for standard page padding. Use `absolute inset-0` for immersive full-screen flows.
- **Typography**: `Inter` for standard sans-serif text; `Geist_Mono` for monospaced technical elements. Use tracking (e.g. `tracking-tight`) for display headers.
- **Colors**: Never hardcode hex values. Always use semantic CSS variables (e.g., `bg-background`, `text-primary`, `border-border`).
- **Motion**: Rely on Framer Motion's `motion/react` combined with variants in `lib/animations.ts`. Prefer `easeOut` and `gentleSpring` for interactive elements. Keep animations subtle and responsive (do not block the user).
- **Border Radius**: Utilize rounded corners heavily. Inputs/buttons use `rounded-lg` or `rounded-xl`. Immersive cards use `rounded-2xl` or `rounded-3xl`.
- **Shadows**: Favor soft, diffused shadows. Use `shadow-glow` or `shadow-2xl` to elevate interactive elements above immersive dark backgrounds.

---

## 8. Coding Guidelines

- **Composition > Inheritance**: Build complex UIs by composing small, focused React components.
- **Feature Isolation**: Keep components scoped to their feature unless they are genuinely shared.
- **No Circular Dependencies**: Ensure a unidirectional dependency graph. Use `madge` if in doubt.
- **Pure UI**: React components should focus on rendering. Complex business logic should reside in Services, Stores, or abstracted Hooks.
- **Framework-Agnostic Services**: Services (`CameraService`, `CaptureService`) must be plain TypeScript classes/objects with zero reliance on React hooks or DOM side-effects outside of their direct API calls.
- **Strict TypeScript**: Avoid `any` without extreme justification. Rely heavily on interfaces and union types. 

---

## 9. Performance Guidelines

- **Lazy-Load Heavy ML**: Sprints 4-6 introduce MediaPipe and ONNX. These SDKs MUST be loaded using Next.js `next/dynamic` with `{ ssr: false }` or dynamic `import()` to guarantee the landing page remains perfectly lightweight.
- **Render Optimization**: Avoid unnecessary re-renders in heavy contexts (like `PhotoStage` or `PuzzleStage`). Memoize handlers only when passing them to deep child components.
- **MediaStream Hygiene**: Never maintain duplicate active MediaStream instances. `CameraProvider` guarantees singleton hardware access. Ensure previous streams are stopped synchronously before acquiring new ones.

---

## 10. Future Extension Points

The architecture is designed to accommodate the upcoming Sprints without massive refactors:

- **Sprint 4 (Background Studio)**: Integrates directly into the flow *after* `Photo Booth` completes its required captures. It will consume the `capturedPhotos` array from Zustand, process them, and output modified images without touching the Camera Engine.
- **Sprint 5 (Puzzle Engine)**: Mounts as an entirely separate full-screen interactive route. Consumes finalized images and generates the canvas game board.
- **Sprint 6 (Hand Tracking)**: Will act as a transparent overlay/listener. `HandTrackingProvider` will intercept webcam frames, run MediaPipe, and dispatch virtual pointer events that the `Puzzle Engine` natively reacts to, requiring zero complex coupling between the two systems.
