import type { BackgroundConfig } from "@/features/background-studio/types";

class CompositorService {
  /**
   * Composes the original image, mask, and background onto the target canvas.
   */
  composeToCanvas(
    targetCanvas: HTMLCanvasElement,
    imageSource: HTMLImageElement,
    maskArray: Uint8ClampedArray | null,
    config: BackgroundConfig
  ) {
    const width = imageSource.width;
    const height = imageSource.height;
    
    targetCanvas.width = width;
    targetCanvas.height = height;
    
    const ctx = targetCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background
    if (config.type !== "original") {
      this.drawBackground(ctx, width, height, config);
    }

    // 2. Draw Image (with or without mask)
    if (config.type === "original" || !maskArray) {
      ctx.drawImage(imageSource, 0, 0, width, height);
      return;
    }

    // 3. Apply Mask
    const offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) return;
    
    offCtx.drawImage(imageSource, 0, 0, width, height);
    const imgData = offCtx.getImageData(0, 0, width, height);
    
    for (let i = 0; i < maskArray.length; i++) {
      // Background is 0 in the selfie_segmenter category mask
      if (maskArray[i] === 0) {
        imgData.data[i * 4 + 3] = 0; // Set Alpha to 0
      }
    }
    
    offCtx.putImageData(imgData, 0, 0);
    ctx.drawImage(offscreen, 0, 0, width, height);
  }

  private drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, config: BackgroundConfig) {
    if (config.type === "transparent") {
      return; 
    }
    
    if (config.type === "solid" && config.color) {
      ctx.fillStyle = config.color;
      ctx.fillRect(0, 0, width, height);
    }
    
    if (config.type === "gradient" && config.gradient) {
      const { colorStart, colorEnd, angle } = config.gradient;
      const radian = (angle * Math.PI) / 180;
      
      const x2 = width / 2 + Math.cos(radian) * width;
      const y2 = height / 2 + Math.sin(radian) * height;
      
      const grad = ctx.createLinearGradient(0, 0, x2, y2);
      grad.addColorStop(0, colorStart);
      grad.addColorStop(1, colorEnd);
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
  }

  /**
   * Finalizes composition to a Data URL
   */
  composeToDataUrl(
    imageSource: HTMLImageElement,
    maskArray: Uint8ClampedArray | null,
    config: BackgroundConfig
  ): string {
    const canvas = document.createElement("canvas");
    this.composeToCanvas(canvas, imageSource, maskArray, config);
    return canvas.toDataURL("image/png");
  }
}

export const compositorService = new CompositorService();
