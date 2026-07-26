import { useEffect, useRef, useState, useCallback } from "react";
import { useBackgroundStore } from "@/store/background-store";
import { useCaptureStore } from "@/store/camera-store";
import { segmentationService } from "../services/segmentation.service";
import { compositorService } from "../services/compositor.service";
import type { CapturedPhoto } from "@/types";

export function useBackground() {
  const { 
    backgroundConfig, 
    setBackgroundConfig, 
    setProcessingStatus, 
    setProcessingProgress, 
    processingStatus,
    processingProgress
  } = useBackgroundStore();
  
  const { capturedPhotos } = useCaptureStore();
  
  // Cache masks by photo ID
  const maskCache = useRef<Map<string, Uint8ClampedArray>>(new Map());
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      useBackgroundStore.getState().reset();
    };
  }, []);

  const initializeAndProcess = useCallback(async () => {
    if (processingStatus !== "IDLE") return;

    try {
      setProcessingStatus("INITIALIZING");
      await segmentationService.initialize();
      
      setProcessingStatus("PROCESSING");
      
      for (let i = 0; i < capturedPhotos.length; i++) {
        setProcessingProgress({ current: i + 1, total: capturedPhotos.length });
        const photo = capturedPhotos[i];
        
        if (!maskCache.current.has(photo.id)) {
          const img = new Image();
          img.src = photo.image;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          
          const mask = await segmentationService.segment(img);
          maskCache.current.set(photo.id, mask);
        }
      }
      
      setProcessingStatus("DONE");
    } catch (err) {
      console.error(err);
      setProcessingStatus("ERROR");
    }
  }, [capturedPhotos, processingStatus, setProcessingProgress, setProcessingStatus]);

  const getActivePhoto = () => {
    return capturedPhotos[activePhotoIndex] || null;
  };
  
  const getActiveMask = () => {
    const photo = getActivePhoto();
    if (!photo) return null;
    return maskCache.current.get(photo.id) || null;
  };

  const finalizePhotos = async (): Promise<CapturedPhoto[]> => {
    const finalizedPhotos: CapturedPhoto[] = [];
    
    for (const photo of capturedPhotos) {
      const mask = maskCache.current.get(photo.id) || null;
      
      const img = new Image();
      img.src = photo.image;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      const processedDataUrl = compositorService.composeToDataUrl(img, mask, backgroundConfig);
      
      finalizedPhotos.push({
        ...photo,
        image: processedDataUrl,
      });
    }
    
    return finalizedPhotos;
  };

  return {
    backgroundConfig,
    setBackgroundConfig,
    processingStatus,
    processingProgress,
    initializeAndProcess,
    activePhotoIndex,
    setActivePhotoIndex,
    getActivePhoto,
    getActiveMask,
    capturedPhotos,
    finalizePhotos,
  };
}
