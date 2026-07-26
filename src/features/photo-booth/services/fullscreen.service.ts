interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface FullscreenDocument extends Document {
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

class FullscreenService {
  /**
   * Toggles fullscreen mode on the provided element or the document body.
   */
  async toggleFullscreen(element: HTMLElement = document.body): Promise<void> {
    const fsElement = element as FullscreenElement;
    const fsDoc = document as FullscreenDocument;

    if (!document.fullscreenElement) {
      if (fsElement.requestFullscreen) {
        await fsElement.requestFullscreen();
      } else if (fsElement.webkitRequestFullscreen) {
        await fsElement.webkitRequestFullscreen();
      } else if (fsElement.msRequestFullscreen) {
        await fsElement.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (fsDoc.webkitExitFullscreen) {
        await fsDoc.webkitExitFullscreen();
      } else if (fsDoc.msExitFullscreen) {
        await fsDoc.msExitFullscreen();
      }
    }
  }

  /**
   * Returns whether the document is currently in fullscreen mode.
   */
  isFullscreen(): boolean {
    return !!document.fullscreenElement;
  }
}

export const fullscreenService = new FullscreenService();
