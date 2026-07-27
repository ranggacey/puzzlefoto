import { motionTokens } from "./tokens";
import type { Variants } from "motion/react";

export const variants = {
  button: {
    idle: {
      scale: motionTokens.scale.idle,
      filter: "brightness(1)",
      transition: motionTokens.springs.interactive,
    },
    hover: {
      scale: motionTokens.scale.hover,
      filter: "brightness(1.1)",
      transition: motionTokens.springs.interactive,
    },
    press: {
      scale: motionTokens.scale.press,
      filter: "brightness(0.9)",
      transition: motionTokens.springs.interactive,
    },
  } as Variants,
  
  overlay: {
    hidden: {
      opacity: motionTokens.opacity.hidden,
      scale: motionTokens.scale.hidden,
      transition: { duration: motionTokens.durations.normal, ease: motionTokens.easings.exit },
    },
    visible: {
      opacity: motionTokens.opacity.visible,
      scale: motionTokens.scale.idle,
      transition: motionTokens.springs.overlay,
    },
    exit: {
      opacity: motionTokens.opacity.hidden,
      scale: motionTokens.scale.hidden,
      transition: { duration: motionTokens.durations.fast, ease: motionTokens.easings.exit },
    },
  } as Variants,

  puzzle: {
    idle: {
      opacity: motionTokens.opacity.idle,
      scale: motionTokens.scale.idle,
      zIndex: 10,
      filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
      boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.2)",
      transition: motionTokens.springs.puzzle.idle,
    },
    hover: {
      opacity: motionTokens.opacity.hover,
      scale: motionTokens.scale.hover,
      zIndex: 20,
      filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.4))",
      boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.4)",
      transition: motionTokens.springs.puzzle.idle,
    },
    active: {
      opacity: motionTokens.opacity.visible,
      scale: motionTokens.scale.active,
      zIndex: 50,
      filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.5))",
      boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.4)",
      transition: motionTokens.springs.puzzle.active,
    },
    selected: {
      opacity: motionTokens.opacity.visible,
      scale: motionTokens.scale.active,
      zIndex: 50,
      filter: "drop-shadow(0 12px 24px rgba(34, 197, 94, 0.5))",
      boxShadow: "inset 0 0 0 2px rgba(34, 197, 94, 0.8)",
      transition: motionTokens.springs.puzzle.idle,
    },
    swapTarget: {
      opacity: motionTokens.opacity.hover,
      scale: motionTokens.scale.hover,
      zIndex: 20,
      filter: "drop-shadow(0 8px 12px rgba(59, 130, 246, 0.5))",
      boxShadow: "inset 0 0 0 2px rgba(59, 130, 246, 0.8)",
      transition: motionTokens.springs.puzzle.idle,
    },
    locked: {
      opacity: motionTokens.opacity.visible,
      scale: motionTokens.scale.idle,
      zIndex: 1,
      filter: "drop-shadow(0 0 12px rgba(255,255,255,0.3)) drop-shadow(0 0 4px rgba(255,255,255,0.5))",
      boxShadow: "inset 0 0 0 0px rgba(255, 255, 255, 0)",
      transition: { duration: motionTokens.durations.normal, ease: motionTokens.easings.smooth },
    },
  } as Variants,

  pointer: {
    idle: {
      scale: 1,
      opacity: 0.8,
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.5)",
      transition: motionTokens.springs.pointer,
    },
    hover: {
      scale: 1.2,
      opacity: 1,
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.9)",
      transition: motionTokens.springs.pointer,
    },
    grab: {
      scale: 0.9,
      opacity: 1,
      borderWidth: 3,
      borderColor: "rgba(255,255,255,1)",
      transition: motionTokens.springs.pointer,
    },
  } as Variants,
} as const;
