# Motion Design System

## Philosophy
The Motion Design System standardizes every animation throughout Vision Puzzle.
Every interaction should originate from a shared motion language rather than component-specific implementations.

**Key principles:**
- **No Magic Numbers:** Never use raw transition values (`duration: 0.3`, `stiffness: 300`) inside components.
- **Composition over Duplication:** Always prefer using an existing preset. Only create new variants when a motion pattern is shared by multiple components.
- **Respect Accessibility:** Support `prefers-reduced-motion` to provide a comfortable experience for everyone.
- **Feedback First:** Motion should reinforce interaction intent and provide clarity, never distract from gameplay.

## Structure
- **Tokens (`src/lib/motion/tokens.ts`)**: Primitives including `durations`, `easings`, `springs`, `scale`, and `opacity`.
- **Variants (`src/lib/motion/variants.ts`)**: Intermediate logic composing tokens into stateful transitions.
- **Presets (`src/lib/motion/presets.ts`)**: High-level, component-specific maps (e.g. `button`, `puzzle`, `overlay`, `pointer`).
- **Stagger (`src/lib/motion/stagger.ts`)**: Pre-configured stagger configurations for orchestrating children sequences.

## Usage Guide
1. Import `motionPresets` or `stagger` from `@/lib/motion`.
2. Apply the preset via the `variants` prop on a `motion.div` or `motion.button`.
3. Animate between standardized keys (e.g., `idle`, `hover`, `press`, `hidden`, `visible`).

```tsx
import { motion } from "motion/react";
import { motionPresets } from "@/lib/motion";

function MyButton() {
  return (
    <motion.button
      variants={motionPresets.button}
      initial="idle"
      whileHover="hover"
      whileTap="press"
    >
      Click Me
    </motion.button>
  );
}
```

## Motion Inspector
In development mode (`process.env.NODE_ENV === 'development'`), a **Motion Inspector** panel appears in the bottom-left corner. It visualizes the current reduced-motion status, base tokens, and tracks the globally hovered DOM element to assist in debugging micro interactions.
