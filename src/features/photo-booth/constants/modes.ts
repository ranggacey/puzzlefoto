import { CaptureMode, CaptureModeConfig } from "@/types";

export const MODE_CONFIGS: Record<CaptureMode, CaptureModeConfig> = {
  [CaptureMode.SINGLE]: {
    id: CaptureMode.SINGLE,
    title: "Single Photo",
    description: "One perfect photo. Best for solo puzzle solving.",
    requiredPhotos: 1,
    aspectRatio: "16:9",
    previewLayout: "single",
    allowMirror: true,
    allowBackgroundRemoval: true,
  },
  [CaptureMode.GRID_2X2]: {
    id: CaptureMode.GRID_2X2,
    title: "2×2 Grid",
    description: "Capture four images and combine them into a stylish grid.",
    requiredPhotos: 4,
    aspectRatio: "1:1",
    previewLayout: "grid",
    allowMirror: true,
    allowBackgroundRemoval: true,
  },
  [CaptureMode.FILM_STRIP]: {
    id: CaptureMode.FILM_STRIP,
    title: "Film Strip",
    description: "Classic photo booth style vertical strip of four photos.",
    requiredPhotos: 4,
    aspectRatio: "3:4",
    previewLayout: "filmStrip",
    allowMirror: true,
    allowBackgroundRemoval: true,
  },
};
