export const InteractionConfig = {
  trackingPersistenceMs: 180,
  dragPersistenceMs: 200,
  releaseConfirmationMs: 300,
  
  pinchStartDistance: 0.045,
  pinchEndDistance: 0.065,
  
  hoverRadius: 48,
  magneticStrength: 0.75,
  magneticStrengthGrabbed: 0.85,
  
  logicalHitboxScale: 0.9,
  
  adaptiveSmoothing: {
    slow: 0.82,
    fast: 0.45,
  },
  
  pointerSize: {
    idle: 24,
    hover: 34,
    grab: 40,
  },
  dragOffsetY: 30,
};
