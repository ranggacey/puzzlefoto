import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { BackgroundConfig, ProcessingStatus, ProcessingProgress } from "@/features/background-studio/types";

import type { CapturedPhoto } from "@/types";

interface BackgroundState {
  backgroundConfig: BackgroundConfig;
  processingStatus: ProcessingStatus;
  processingProgress: ProcessingProgress;
  processedPhotos: CapturedPhoto[];
  
  setBackgroundConfig: (config: BackgroundConfig) => void;
  setProcessingStatus: (status: ProcessingStatus) => void;
  setProcessingProgress: (progress: ProcessingProgress) => void;
  setProcessedPhotos: (photos: CapturedPhoto[]) => void;
  reset: () => void;
}

const initialConfig: BackgroundConfig = {
  type: "original"
};

export const useBackgroundStore = create<BackgroundState>()(
  devtools(
    (set) => ({
      backgroundConfig: initialConfig,
      processingStatus: "IDLE",
      processingProgress: { current: 0, total: 0 },
      processedPhotos: [],
      
      setBackgroundConfig: (config) => set({ backgroundConfig: config }),
      setProcessingStatus: (status) => set({ processingStatus: status }),
      setProcessingProgress: (progress) => set({ processingProgress: progress }),
      setProcessedPhotos: (photos) => set({ processedPhotos: photos }),
      reset: () => set({ 
        backgroundConfig: initialConfig, 
        processingStatus: "IDLE", 
        processingProgress: { current: 0, total: 0 },
        processedPhotos: []
      }),
    }),
    { name: "BackgroundStore" }
  )
);
