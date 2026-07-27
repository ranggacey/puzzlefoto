import { Transition } from "motion/react";

export const springs = {
  interactive: {
    type: "spring",
    stiffness: 400,
    damping: 25,
  } as Transition,
  overlay: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  } as Transition,
  pointer: {
    type: "spring",
    stiffness: 400,
    damping: 25, // Responsive but smooth
  } as Transition,
  puzzle: {
    idle: { type: "spring", stiffness: 300, damping: 30 },
    active: { type: "spring", stiffness: 100, damping: 20 },
  },
  completion: {
    type: "spring",
    stiffness: 200,
    damping: 15,
  } as Transition,
} as const;
