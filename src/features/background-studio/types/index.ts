export type BackgroundType = "original" | "transparent" | "solid" | "gradient" | "image";

export interface GradientConfig {
  colorStart: string;
  colorEnd: string;
  angle: number;
}

export interface BackgroundConfig {
  type: BackgroundType;
  color?: string;
  gradient?: GradientConfig;
  image?: string;
}

export type ProcessingStatus = 
  | "IDLE"
  | "INITIALIZING"
  | "READY"
  | "PROCESSING"
  | "DONE"
  | "ERROR";

export interface ProcessingProgress {
  current: number;
  total: number;
}
