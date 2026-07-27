export const easings = {
  // Common cubic bezier curves for UI motion
  enter: [0.0, 0.0, 0.2, 1], // Standard deceleration (material 'easeOut')
  exit: [0.4, 0.0, 1, 1], // Standard acceleration (material 'easeIn')
  smooth: [0.4, 0.0, 0.2, 1], // Standard ease-in-out (material 'easeInOut')
  emphasize: [0.2, 0.0, 0, 1], // Emphasized deceleration
} as const;
