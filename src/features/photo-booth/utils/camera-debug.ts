export const CAMERA_DEBUG = true;

export function cameraDebug(message: string, ...args: unknown[]) {
  if (CAMERA_DEBUG) {
    console.log(`%c${message}`, "color: #00ff00; font-weight: bold;", ...args);
  }
}

export function cameraWarn(message: string, ...args: unknown[]) {
  if (CAMERA_DEBUG) {
    console.warn(`%c⚠️ ${message}`, "color: #ffaa00; font-weight: bold;", ...args);
  }
}

export function cameraError(message: string, ...args: unknown[]) {
  if (CAMERA_DEBUG) {
    console.error(`%c🚨 ${message}`, "color: #ff0000; font-weight: bold;", ...args);
  }
}

export function logStreamInfo(stream: MediaStream | null, prefix = "[Stream Info]") {
  if (!CAMERA_DEBUG) return;
  if (!stream) {
    cameraWarn(`${prefix} stream == null`);
    return;
  }
  
  const videoTracks = stream.getVideoTracks();
  const track = videoTracks[0];
  
  console.groupCollapsed(`%c${prefix} Stream: ${stream.id}`, "color: #00ccff;");
  console.log(`Active: ${stream.active}`);
  console.log(`Track count: ${videoTracks.length}`);
  
  if (track) {
    console.log(`Track readyState: ${track.readyState}`);
    console.log(`Track enabled: ${track.enabled}`);
    console.log(`Track muted: ${track.muted}`);
    console.log(`Label: ${track.label}`);
    
    try {
      const settings = track.getSettings();
      console.log(`Settings:`, settings);
      console.log(`Width: ${settings.width}`);
      console.log(`Height: ${settings.height}`);
      console.log(`FrameRate: ${settings.frameRate}`);
    } catch (e) {
      console.log("Could not get track settings", e);
    }
  }
  console.groupEnd();
}

const timers = new Map<string, number>();

export function startCameraTimer(label: string) {
  if (!CAMERA_DEBUG) return;
  timers.set(label, performance.now());
  cameraDebug(`[Timing] ⏱️ started: ${label}`);
}

export function logCameraTimer(label: string, message: string) {
  if (!CAMERA_DEBUG) return;
  const start = timers.get(label);
  if (start) {
    const elapsed = Math.round(performance.now() - start);
    cameraDebug(`[Timing] ⏱️ ${message}: ${elapsed}ms`);
  }
}

export function endCameraTimer(label: string) {
  if (!CAMERA_DEBUG) return;
  const start = timers.get(label);
  if (start) {
    const elapsed = Math.round(performance.now() - start);
    cameraDebug(`[Timing] ⏱️ finished ${label}: ${elapsed}ms`);
    timers.delete(label);
  }
}
