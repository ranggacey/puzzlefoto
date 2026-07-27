import { motionTokens } from "./tokens";

export const stagger = {
  small: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: motionTokens.durations.stagger.small,
      },
    },
  },
  medium: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: motionTokens.durations.stagger.medium,
      },
    },
  },
  large: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: motionTokens.durations.stagger.large,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: motionTokens.durations.normal, ease: motionTokens.easings.smooth } 
    },
  },
} as const;
