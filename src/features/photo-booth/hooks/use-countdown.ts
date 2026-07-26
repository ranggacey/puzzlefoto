import { useState, useCallback, useRef, useEffect } from "react";
import { useCaptureStore } from "@/store/camera-store";
import { CountdownOption } from "../constants/camera";

export function useCountdown(onCapture: () => void) {
  const { setCapturing } = useCaptureStore();
  const [activeCountdown, setActiveCountdown] = useState<CountdownOption>(0);
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    if (activeCountdown === 0) {
      setCapturing(true);
      onCapture();
      return;
    }

    setCapturing(true);
    setCurrentValue(activeCountdown);

    timerRef.current = setInterval(() => {
      setCurrentValue((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearTimer();
          onCapture();
          return null; // hide countdown
        }
        return prev - 1;
      });
    }, 1000);
  }, [activeCountdown, clearTimer, onCapture, setCapturing]);

  const cancelCountdown = useCallback(() => {
    clearTimer();
    setCurrentValue(null);
    setCapturing(false);
  }, [clearTimer, setCapturing]);

  // Cleanup on unmount
  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return {
    activeCountdown,
    setActiveCountdown,
    currentValue,
    startCountdown,
    cancelCountdown,
  };
}
