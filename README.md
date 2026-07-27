# Vision Puzzle

An interactive computer vision web application combining AI-powered photo capture with hand gesture-controlled puzzle gameplay. Built with Next.js and MediaPipe.

---

## Screenshots

TODO: Landing Page

TODO: Photo Booth & Background Studio

TODO: Camera Experience & Calibration

TODO: Puzzle Gameplay

TODO: Completion Screen

---

## Features

- **Immersive Photo Booth**: Real-time webcam preview, countdown capture, and multiple layout formats.
- **AI Background Studio**: Real-time background segmentation and removal using `@mediapipe/tasks-vision`, allowing users to apply custom colors and gradients to their portraits.
- **Hand Tracking Input Layer**: Fully decoupled, real-time AI hand tracking running inside the browser to map physical hand movements to a virtual pointer on screen.
- **Gesture-Controlled Puzzle Engine**: A custom Canvas-based puzzle generator and rendering engine with a deterministic "Select & Swap" interaction model powered by pinch gestures.
- **Motion Design System**: Application-wide, meticulously crafted micro-interactions powered by Framer Motion, fully accessible and respectful of `prefers-reduced-motion` settings.
- **Unified Interaction Surfaces**: Seamless normalization between native mouse/touch inputs and AI synthetic pointer events, producing a cohesive AR-like interface experience.

---

## Tech Stack

**Core Frameworks**
- [Next.js 16 (App Router)](https://nextjs.org/)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)

**Computer Vision & AI**
- [MediaPipe Tasks Vision](https://developers.google.com/mediapipe) (Hand Tracking & Selfie Segmentation)

**State Management**
- [Zustand](https://zustand-demo.pmnd.rs/)

**Styling & UI**
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Framer Motion](https://motion.dev/)
- [Shadcn UI](https://ui.shadcn.com/) & Base UI
- Lucide React (Icons)

---

## Architecture Overview

Vision Puzzle is built upon a strictly governed modular architecture favoring composition, isolation, and explicit state machines over coupling.

1. **Single Source of Truth**: All core business logic and state are managed by feature-specific Zustand stores (e.g., `PuzzleStore`, `UIStore`).
2. **Infrastructure Decoupling**: Hardware interactions (`CameraService`, MediaStreams) are abstracted away from presentation components and managed by persistent React Context Providers.
3. **AI Processing Isolation**: AI models run autonomously. The Hand Tracking layer (`HandTrackingProvider` and `GestureRecognizer`) analyzes video frames, normalizes the data, and dispatches standardized synthetic events via the `InteractionDispatcher`. It never mutates gameplay state directly.
4. **Deterministic State Machines**: Complex user flows like capturing a photo and playing the puzzle are modeled as explicit state machines (`camera` → `capture` → `calibration` → `gameplay`) ensuring a reliable and highly immersive, continuous presentation without route jumps or component unmounting.

Read the full architecture contract in [`docs/ARCHITECTURE_FREEZE.md`](docs/ARCHITECTURE_FREEZE.md).

---

## Project Structure

```text
.
├── docs/                      # Architectural documentation, roadmaps, and changelogs
├── public/                    # Static assets, SVG icons, and MediaPipe models
└── src/
    ├── app/                   # Next.js App Router (Layouts, pages, global CSS)
    ├── components/            # Shared primitives, layouts, and generic UI
    ├── constants/             # Immutable global configurations (Site, Tech Stack)
    ├── features/              # Isolated feature modules (The core application)
    │   ├── hand-tracking/     # AI processing, virtual pointer, and gesture recognition
    │   ├── landing/           # Public marketing and introduction pages
    │   ├── photo-booth/       # Camera capture and AI background studio
    │   └── puzzle/            # The jigsaw generation and gameplay engine
    ├── hooks/                 # Shared generic React hooks
    ├── lib/                   # Utilities, debug loggers, and the Motion Design System
    ├── services/              # Global infrastructure services
    ├── store/                 # Zustand global state machines
    └── types/                 # Universal TypeScript definitions
```

---

## Installation & Running Locally

### Prerequisites
- Node.js (v20 or higher recommended)
- `npm` package manager

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd puzzle-foto
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** Since the application heavily relies on `navigator.mediaDevices` for camera access, you must run it over `localhost` or a secure `https://` context, otherwise the browser will block webcam permissions.

---

## Puzzle Gameplay Flow

The Vision Puzzle experience is designed as an uninterrupted pipeline that bridges photography with gaming:

1. **Capture:** The user takes a picture in the Photo Booth. The `CameraService` abstracts browser hardware to provide a clean feed.
2. **AI Process (Optional):** The captured image can optionally be passed through the Background Studio to remove clutter and apply a clean gradient or solid color via MediaPipe Selfie Segmentation.
3. **Generate:** The `PuzzleGenerator` predictably calculates slot grids, cuts the image into canvas-rendered jigsaw pieces, and randomizes their starting positions.
4. **Assemble (Play):** Users assemble the puzzle. The `PuzzleStore` continuously validates slot proximity and snaps pieces into their correct grid locations.

---

## Hand Tracking & Interaction

Instead of relying solely on a mouse or touch screen, Vision Puzzle integrates an AR-style interaction layer powered by MediaPipe. 

1. **Continuous Analysis:** The `HandTrackingProvider` securely borrows the active `MediaStream` and runs hand landmark detection on every frame.
2. **Gesture Recognition:** The `GestureRecognizer` processes raw landmarks to debounce and detect distinct interactions like *Hover*, *Pinch*, and *Release*.
3. **Virtual Pointer:** The user's hand drives a virtual on-screen cursor (`PointerOverlay`) augmented with visual feedback (glows, trails).
4. **Select & Swap Model:** To ensure high stability even with webcam jitter, the puzzle relies on a "Select & Swap" interaction model. Users hover over a piece for 500ms (or pinch) to select it, then move the pointer to a target slot and pinch to swap pieces.
5. **Magnetic Assistance:** As the pointer approaches valid target pieces, the `InteractionAssistService` applies adaptive magnetic attraction to snap the cursor into place, making interaction effortless.

---

## Roadmap

**Current Status:** The core Camera, Background Studio, Hand Tracking, and Puzzle Engine features are complete.

**Next Steps (Sprint 7: Export & Social):**
- Save finalized puzzle photos to the device.
- Generate custom challenge links with shared puzzle configurations.
- Time tracking and score keeping leaderboards.

For a full historical timeline, see [`docs/ROADMAP.md`](docs/ROADMAP.md) and [`docs/CHANGELOG.md`](docs/CHANGELOG.md).

---

## License

MIT License

## Author

**Rizal Kurnia**  
[https://www.puzzlefoto.my.id/](https://www.puzzlefoto.my.id/)
