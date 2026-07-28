// ============================================================
// Shared motion variants and transitions
// ============================================================

import type { Variants, Transition } from "motion/react";

// ----- Transitions -----

export const easeOut: Transition = {
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1],
};

export const easeInOut: Transition = {
  duration: 0.5,
  ease: [0.42, 0, 0.58, 1],
};

export const spring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const gentleSpring: Transition = {
  type: "spring",
  stiffness: 150,
  damping: 20,
};

// ----- Fade variants -----

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: easeOut },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: easeOut },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: easeOut },
};

// ----- Scale variants -----

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: easeOut },
};

// ----- Stagger container -----

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: easeOut,
  },
};

// ----- Slide variants -----

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: easeOut },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: easeOut },
};

// ----- Viewport trigger defaults -----

export const viewportOnce = {
  once: true,
  margin: "-80px" as const,
};

// ----- Feature card hover variant -----

export const featureCard: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 25,
    },
  },
};
