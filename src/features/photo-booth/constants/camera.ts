export const DEFAULT_CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: "user",
    frameRate: {
      ideal: 60,
      max: 60,
    },
  },
  audio: false,
};

export const COUNTDOWN_OPTIONS = [0, 3, 5, 10] as const;
export type CountdownOption = typeof COUNTDOWN_OPTIONS[number];
