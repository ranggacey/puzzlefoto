# Vision Puzzle — Architecture Specification

This document is the architectural constitution of Vision Puzzle. It defines the permanent, non-negotiable architectural contract for the project. 

---

## 1. Architectural Principles

Every subsystem and feature in Vision Puzzle must be built upon the following core principles:

- **Single Responsibility**: Every module, class, hook, or component does exactly one thing and has one reason to change.
- **Single Source of Truth**: Data and state exist in exactly one place. Duplication of state is strictly prohibited.
- **Feature Isolation**: Features are vertical slices that do not know about each other's internals.
- **Composition over Coupling**: Complex systems are built by composing isolated, decoupled subsystems rather than inheriting or sharing tight dependencies.
- **Infrastructure vs Presentation**: A strict separation exists between the systems that acquire resources (Infrastructure) and the components that display them (Presentation).
- **Long-lived Infrastructure**: Expensive resources (MediaStreams, AI models) are managed by persistent infrastructure providers and kept alive as long as semantically required.
- **Deterministic State Machines**: Complex user flows and UI states are modeled as explicit, deterministic state machines rather than loose boolean flags.
- **Documentation First**: Architectural changes must be documented before they are implemented.
- **Architecture before Features**: Features must adapt to the architecture. The architecture is never compromised for the sake of implementing a feature quickly.

---

## 2. High-Level Architecture

The application is structured into clearly delineated architectural domains:

- **Landing**: The lightweight, public-facing introduction to the product. Fully isolated from interactive camera flows.
- **Photo Booth**: Provides user-controlled photo capture, editing, background manipulation, and export.
- **Camera Infrastructure**: A headless, framework-agnostic abstraction layer managing hardware capabilities and active device streams.
- **Background Studio**: Provides intelligent background removal and customization for the Photo Booth workflow.
- **Puzzle Experience**: Owns the immersive Puzzle flow, orchestrating the camera lifecycle, automated capture sequence, floating photo presentation, and calibration.
- **Puzzle Engine**: Responsible solely for puzzle generation, piece management, physics, snapping, and win validation.
- **Hand Tracking**: A decoupled AI input layer that consumes existing camera streams and dispatches normalized pointer and gesture events.
- **Shared AI Services**: Reusable, agnostic models providing intelligent processing (like segmentation or tracking) to features.

---

## 3. Infrastructure Layer

Infrastructure components manage hardware, side-effects, and heavy resources. They exist independently of the UI.

- **`CameraService`**: Abstract hardware integration (`navigator.mediaDevices`).
- **`CaptureService`**: Abstract frame extraction and Canvas processing.
- **AI Services**: Framework-agnostic classes handling ML model loading and inference.
- **`FullscreenService`**: Standardizes browser-specific fullscreen APIs.
- **Providers (e.g., `PuzzleCameraProvider`)**: React integration layers that mount infrastructure and manage its active lifecycle state.
- **Global Stores**: Zustand stores providing the central memory (Single Source of Truth) for the application state.

**Rule**: Infrastructure owns and manages resources. Presentation layers only consume them.

---

## 4. Folder Responsibilities

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

## 5. Dependency Rules

To prevent accidental coupling, strictly enforce the following boundaries:

- **Feature Isolation**: Features communicate only through public APIs. A feature must never import deep internals from another feature (e.g., `import { X } from "@/features/other/components/X"`).
- **Presentation Decoupling**: Puzzle Engine, Background Studio, and UI components must never access `CameraService` or DOM video streams directly. They must consume stable resources exposed by their respective Feature Providers.
- **Input Decoupling**: AI Input (Hand Tracking) must never directly manipulate target subsystems (Puzzle Engine). It must dispatch standardized coordinate/gesture events that the target listens to.

---

## 6. Public APIs

Features expose a minimalistic architectural public API via their barrel file (`index.ts`). Everything not explicitly exported is a strictly private implementation detail.

**Photo Booth Public API**:
- `PhotoBoothCameraProvider`
- `usePhotoBoothCamera()`

**Puzzle Public API**:
- `PuzzleExperience`
- `PuzzleCameraProvider`
- `usePuzzleCamera()`
- `PuzzleStage`
- `PuzzleConfig`

**Hand Tracking Public API**:
- `HandTrackingProvider`
- `useHandTracking()`

---

## 7. Module Ownership

Responsibilities are strictly assigned to single owners. There must be zero overlapping responsibilities.

- **`CameraService`**: Owns interactions with the browser's `MediaDevices` API. Does NOT own camera lifecycle or UI state.
- **Feature Camera Providers**: Own the active MediaStream, its lifecycle (start/stop), and local camera status. Do NOT own global application state or capture logic.
- **`CaptureService`**: Owns extracting frames from a video element to an image format. Does NOT own camera streams or user state.
- **`PuzzleExperience`**: Owns mounting the visual components based on the state machine. Does NOT own game logic.
- **`Puzzle Engine`**: Owns generating puzzle pieces and evaluating victory conditions. Does NOT own camera streams or hand tracking data.
- **`HandTrackingProvider`**: Owns analyzing frames and calculating hand coordinates. Does NOT own camera streams or puzzle state.

---

## 8. State Ownership

Every piece of state must have exactly one owner.

- **Camera Lifecycle**: Owned by feature-specific contexts (`PhotoBoothCameraProvider`, `PuzzleCameraProvider`).
- **Puzzle Scene**: Owned by `usePuzzleStore`. (Controls the architectural state machine).
- **Gameplay**: Owned by `usePuzzleStore`. (Manages piece locations, difficulty, and win state).
- **Hand Tracking**: Owned by `useHandTrackingStore`. (Dispatches normalized pointer coordinates and gestures).
- **UI State**: Owned by `useUIStore`. (Controls transient UI states like generic modals).

---

## 9. Puzzle Experience Architecture

### Puzzle Experience Philosophy
The Puzzle Experience is designed as one uninterrupted immersive session. Users should perceive the experience as a single continuous scene rather than a collection of disconnected pages. Visual transitions are preferred over route transitions. Subsystems preserve continuity across scene changes to maximize immersion. The application must never feel like it is restarting during the flow.

### Camera Lifecycle
During a Puzzle session, exactly one `MediaStream` may exist. It is initialized exactly once, remains alive for the entire Puzzle session, and is released only when leaving `/puzzle`. Scene transitions must never restart or replace the active stream.

### Scene State Machine
The architectural state machine flows continuously:
`Camera` → `Capture` → `Freeze` → `Floating` → `Calibration` → `Gameplay`

State transitions control presentation logic only. They must never trigger infrastructure recreation or teardown.

### Persistent Live Background
`LiveBackground` is long-lived infrastructure. It must remain mounted for the entire Puzzle session and continuously render the active `MediaStream`. State changes modify only visual overlays (Presentation) and must never unmount or interrupt the live feed.

### Camera Capture
`CaptureService` only extracts frames from a provided video element. It never requests permissions, calls `getUserMedia()`, creates MediaStreams, or stops active streams.

### Puzzle Image Pipeline
The Puzzle feature owns a strict, automated image-processing pipeline:
`Camera` → `Capture` → `Automatic Background Segmentation` → `Transparent PNG` → `Floating Photo` → `Puzzle Generation` → `Gameplay`

The generated transparent PNG is immutable. All puzzle pieces are generated from this single transparent source image. Gameplay must never modify or overwrite the original source image, nor use the raw captured frame as its primary source.

### Puzzle and Photo Booth Separation
The Puzzle feature and the Photo Booth are completely independent experiences. Photo Booth provides user-controlled editing and export; Puzzle provides an automated gameplay pipeline. They may share low-level infrastructure (CameraService, AI services) but never user workflows, state, or produced assets.

---

## 10. AI Architecture

AI Models (Background Segmentation, Hand Tracking, Gesture Recognition, and future modules) are architectural primitives.

- **Reusable**: Built to be consumed by multiple distinct features.
- **Framework Agnostic**: Core processing does not rely on React components.
- **Processing Only**: They own inference and processing. They never own UI, never manage routing, and never own application state.

---

## 11. Resource Lifecycle

Long-lived resources require explicit lifecycle management:

- **MediaStream**: Owned and managed by feature `CameraProviders`.
- **Video Element**: Owned by the persistent background component (e.g., `LiveBackground`).
- **AI Models / Workers / ONNX Sessions**: Initialized and kept alive by their respective Infrastructure Providers.

Infrastructure strictly owns resource initialization, maintenance, and teardown. Presentation components only consume these resources while they are alive.

---

## 12. Performance Principles

- **Lazy Loading**: Heavy AI dependencies (MediaPipe, ONNX) MUST be lazy-loaded using dynamic imports to guarantee lightweight initial payloads.
- **Single MediaStream**: Never maintain duplicate active MediaStream instances. Ensure previous streams are stopped synchronously before acquiring new ones.
- **Render Stability**: Avoid unnecessary re-renders in heavy contexts (`PuzzleStage`). 
- **Infrastructure Stability**: Continuous rendering is achieved by updating lightweight presentation layers rather than tearing down and restarting heavy infrastructure components.
- **Memoization**: Memoize context values, callbacks, and heavy components when appropriate to prevent cascading render cycles.

---

## 13. Design System Rules

- **Spacing & Layout**: Utilize Tailwind's standard scales. Use `absolute inset-0` for immersive full-screen flows.
- **Typography**: `Inter` for standard sans-serif text; `Geist_Mono` for monospaced technical elements.
- **Colors**: Never hardcode hex values. Always use semantic CSS variables (`bg-background`, `text-primary`).
- **Motion**: Rely on Framer Motion's `motion/react`. Prefer `easeOut` and `gentleSpring`. Keep animations subtle.
- **Border Radius**: Utilize rounded corners heavily (`rounded-xl`, `rounded-3xl`).
- **Shadows**: Favor soft, diffused shadows to elevate interactive elements.

---

## 14. Coding Guidelines

- **Composition > Inheritance**: Build complex UIs by composing small, focused React components.
- **Feature Isolation**: Keep components scoped to their feature unless they are genuinely shared.
- **No Circular Dependencies**: Ensure a unidirectional dependency graph.
- **Pure UI**: React components should focus on rendering. Complex business logic resides in Services, Stores, or Hooks.
- **Framework-Agnostic Services**: Services must be plain TypeScript classes/objects with zero reliance on React hooks.
- **Strict TypeScript**: Avoid `any` without extreme justification.

---

## 15. Extension Points

Future systems must integrate into Vision Puzzle through **composition**, never by modifying existing subsystem responsibilities.

- **New AI Modules**: Expose normalized data streams via decoupled Stores, allowing the Puzzle Engine to consume them agnostically.
- **New Gameplay Features**: Must be built as layers over the existing `PuzzleStage` without altering the core `PuzzleCameraProvider` or `LiveBackground`.

---

## 16. Architectural Invariants

These rules are permanent, non-negotiable constraints:

1. **One owner per responsibility.**
2. **One single source of truth.**
3. **One active MediaStream per session.**
4. **Infrastructure owns lifecycle; Presentation owns rendering.**
5. **AI owns processing; it never owns UI.**
6. **Stores own application state; Services own business logic.**
7. **No feature imports another feature's internal implementations.**
8. **No duplicated pipelines.**
9. **No hidden architecture changes.**

---

## 17. Non-goals

This architecture intentionally avoids:

- Tight coupling between independent domains.
- "Boolean soup" (using disorganized boolean flags instead of explicit state machines).
- Duplicate infrastructure implementations.
- Multiple active MediaStreams.
- Global mutable state (outside of strictly controlled Zustand stores).
- UI components controlling infrastructure creation/teardown.
- AI modules natively rendering UI overlays.
- Cross-feature dependencies.

---

## 18. Architecture Evolution Policy

Architecture evolves intentionally. Architecture must never drift silently.

Every architectural change requires the following steps:

1. **Documentation Update**: The proposed change must be formally written into `ARCHITECTURE_FREEZE.md` or `DECISIONS.md`.
2. **Review**: The implications of the change are analyzed.
3. **Approval**: The modification is explicitly approved.
4. **Implementation**: Only after approval does the code change begin.
