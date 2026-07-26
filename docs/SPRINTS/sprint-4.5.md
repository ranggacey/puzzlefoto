# Sprint 4.5 — Landing Experience Redesign

## Objective
Reposition the product on the Landing page so that **Vision Puzzle** is clearly communicated as the primary interactive experience, while the Photo Booth becomes a secondary supporting feature.

## Scope
- Restructure the visual hierarchy of the Landing page.
- Create a primary Hero section dedicated exclusively to the Puzzle experience.
- Build lightweight, pure CSS + Framer Motion animations to simulate puzzle cracking/reconstruction.
- Demote the Photo Booth to a secondary Hero section further down the page.
- Refine the "How It Works" 4-step user journey.
- *Out of Scope*: Modifying global Navbar routing, making actual changes to the Puzzle Engine, altering Camera business logic.

## Architecture Impact
- **Animation Decoupling**: The complex Framer Motion sequence was abstracted into an independent `PuzzleHeroAnimation` component. This ensures the Hero layout remains isolated and untouched when the real Puzzle Engine component replaces the placeholder in Sprint 5.
- **Safe Global Navigation**: Refrained from changing global navigation links to prevent users from prematurely accessing incomplete routes.

## Implementation Summary
The landing page was successfully overhauled. The primary Hero now tells a visual story of a photo cracking into pieces and floating, conveying the puzzle concept in less than five seconds without heavy WebGL. The Photo Booth Hero reuses existing UI patterns to mock a camera flow. All animations respect `prefers-reduced-motion` and are GPU-accelerated. The "Start Puzzle" CTA uses an elegant inline notification to gracefully inform users that the feature is arriving in Sprint 5.

## Major Decisions
1. **No Canvas on Landing Page**: Decided exclusively against using Three.js or Canvas APIs for the puzzle hero animation to guarantee the initial page load remains incredibly fast and battery-efficient.
2. **Transform-Only Animations**: Refactored the grid animations to manipulate `x`, `y`, `scale`, and `rotate` rather than structural CSS properties like `gap` to prevent expensive layout thrashing and maintain 60fps performance on mobile.

## Verification
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- Manual testing performed (Verified responsive layout, mobile typography scaling, missing overlaps, and accessibility motion preferences).

## Known Issues
None.

## Lessons Learned
Visualizing an upcoming feature using mocked CSS animations is a highly effective way to validate product positioning without committing to expensive engine development upfront. 

## Next Sprint
**Sprint 5 — Puzzle Experience**: Begin building the core interactive jigsaw puzzle engine, starting with state management and dynamic canvas rendering.
