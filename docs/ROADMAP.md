# Roadmap

This document outlines the long-term Sprint planning and feature progression for Vision Puzzle.

---

## Past Sprints (Completed)
- **Sprint 1**: Project Setup & Architecture
- **Sprint 2**: Design System & Landing Page
- **Sprint 3**: Camera Engine & Photo Booth
- **Sprint 3.5**: Architecture Cleanup & Refactor
- **Sprint 4**: Background Studio (AI Segmentation)
- **Sprint 4.1**: Layout Architecture Standardization
- **Sprint 4.5**: Landing Experience Redesign

---

## Sprint 5: Puzzle Experience
**Goal**: Build the core jigsaw puzzle generation and rendering engine.

- **5.1 - Foundation**: Setup the Puzzle Engine state management and routing.
- **5.2 - Puzzle Generation**: Convert finalized images into jigsaw pieces using Canvas.
- **5.3 - Puzzle Rendering**: Render pieces on the Canvas board with initial mouse/touch interaction.
- **5.4 - Gameplay Polish**: Snap-to-grid validation, completion states, and visual feedback.

---

## Sprint 6: Hand Tracking
**Goal**: Integrate MediaPipe Hand Tracking to allow touchless gameplay.

- **6.1 - MediaPipe Integration**: Implement Hand Tracking module in a Web Worker or isolated process.
- **6.2 - Gesture Recognition**: Detect pinch gestures and open hand gestures.
- **6.3 - Virtual Pointer**: Map hand coordinates to the Canvas and simulate standard pointer events.
- **6.4 - Interaction Polish**: Smooth out jitter, handle temporary tracking loss, and refine accessibility.

---

## Sprint 7: Export & Social
**Goal**: Allow users to save their creations and challenge friends.

- **7.1 - Export**: Save the finalized photo (with background) to the device.
- **7.2 - Sharing**: Generate challenge links containing the puzzle configuration.
- **7.3 - Leaderboards (Optional)**: Time tracking and score keeping.
