import { useState, useRef, useCallback, useEffect } from 'react';

export function useAlgorithmPlayer(trace = []) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [speed,       setSpeed]       = useState(600); // ms per step
  const [isDone,      setIsDone]      = useState(false);
  const timerRef = useRef(null);

  const totalSteps = trace.length;

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const play = useCallback(() => {
    if (currentStep >= totalSteps - 1) {
      setCurrentStep(-1);
      setIsDone(false);
    }
    setIsPlaying(true);
  }, [currentStep, totalSteps]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    clearTimer();
  }, []);

  const stepForward = useCallback(() => {
    setCurrentStep(s => {
      const next = Math.min(s + 1, totalSteps - 1);
      if (next === totalSteps - 1) setIsDone(true);
      return next;
    });
  }, [totalSteps]);

  const stepBackward = useCallback(() => {
    setIsDone(false);
    setCurrentStep(s => Math.max(s - 1, -1));
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    setCurrentStep(-1);
    setIsDone(false);
  }, []);

  const jumpTo = useCallback((step) => {
    setCurrentStep(Math.min(Math.max(step, -1), totalSteps - 1));
    if (step >= totalSteps - 1) setIsDone(true);
  }, [totalSteps]);

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) { clearTimer(); return; }
    timerRef.current = setInterval(() => {
      setCurrentStep(s => {
        const next = s + 1;
        if (next >= totalSteps - 1) {
          clearTimer();
          setIsPlaying(false);
          setIsDone(true);
          return totalSteps - 1;
        }
        return next;
      });
    }, speed);
    return clearTimer;
  }, [isPlaying, speed, totalSteps]);

  // Reset when trace changes
  useEffect(() => {
    reset();
  }, [trace.length]);

  const visibleTrace = currentStep >= 0 ? trace.slice(0, currentStep + 1) : [];
  const currentFrame = trace[currentStep] ?? null;

  return {
    currentStep,
    totalSteps,
    isPlaying,
    isDone,
    speed,
    setSpeed,
    play,
    pause,
    stepForward,
    stepBackward,
    reset,
    jumpTo,
    visibleTrace,
    currentFrame,
  };
}
