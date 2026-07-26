import { usePhotoBoothCamera as useProviderHook } from "@/features/photo-booth/providers/photo-booth-camera-provider";

export function usePhotoBoothCamera() {
  return useProviderHook();
}
