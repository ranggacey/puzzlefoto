import { create } from "zustand";

export interface CameraDiagnostics {
  width: number;
  height: number;
  frameRate: number;
  facingMode?: string;
  deviceId?: string;
}

export interface FpsMetrics {
  current: number;
  average: number;
  min: number;
  max: number;
}

export interface TrackingEvent {
  id: string;
  timestamp: number;
  formattedTime: string;
  type: string;
  reason?: string;
}

export interface TrackingMetrics {
  losses: number;
  recoveries: number;
  averageRecoveryDurationMs: number;
  longestRecoveryMs: number;
  averageConfidence: number;
  lowestConfidence: number;
  highestConfidence: number;
  pinchEvents: number;
  successfulGrabs: number;
  accidentalReleases: number;
}

const initialFps: FpsMetrics = { current: 0, average: 0, min: 0, max: 0 };
const initialTracking: TrackingMetrics = {
  losses: 0,
  recoveries: 0,
  averageRecoveryDurationMs: 0,
  longestRecoveryMs: 0,
  averageConfidence: 0,
  lowestConfidence: 1,
  highestConfidence: 0,
  pinchEvents: 0,
  successfulGrabs: 0,
  accidentalReleases: 0,
};

interface HandTrackingDiagnosticsState {
  camera: CameraDiagnostics | null;
  inferenceFps: FpsMetrics;
  renderFps: FpsMetrics;
  tracking: TrackingMetrics;
  events: TrackingEvent[];

  // Actions
  setCameraDiagnostics: (camera: CameraDiagnostics) => void;
  setInferenceFps: (fps: FpsMetrics) => void;
  setRenderFps: (fps: FpsMetrics) => void;
  setTrackingMetrics: (metrics: Partial<TrackingMetrics>) => void;
  addEvent: (event: Omit<TrackingEvent, "id" | "formattedTime">) => void;
}

export const useHandTrackingDiagnostics = create<HandTrackingDiagnosticsState>((set) => ({
  camera: null,
  inferenceFps: initialFps,
  renderFps: initialFps,
  tracking: initialTracking,
  events: [],

  setCameraDiagnostics: (camera) => set({ camera }),
  setInferenceFps: (inferenceFps) => set({ inferenceFps }),
  setRenderFps: (renderFps) => set({ renderFps }),
  setTrackingMetrics: (metrics) =>
    set((state) => ({ tracking: { ...state.tracking, ...metrics } })),
  addEvent: (event) =>
    set((state) => {
      const pad = (n: number) => n.toString().padStart(2, "0");
      const date = new Date(event.timestamp);
      const formattedTime = `${pad(date.getMinutes())}:${pad(date.getSeconds())}.${date.getMilliseconds().toString().padStart(3, "0")}`;
      
      const newEvent: TrackingEvent = {
        ...event,
        id: crypto.randomUUID(),
        formattedTime,
      };

      const newEvents = [newEvent, ...state.events];
      if (newEvents.length > 100) {
        newEvents.pop(); // Keep last 100
      }
      return { events: newEvents };
    }),
}));
