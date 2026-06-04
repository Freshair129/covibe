import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimerOptions {
  timeout: number;
  onIdle: () => void;
  isActive: boolean;
}

export function useIdleTimer({ timeout, onIdle, isActive }: UseIdleTimerOptions) {
  const timerRef = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    
    if (isActive) {
      timerRef.current = window.setTimeout(() => {
        onIdle();
      }, timeout);
    }
  }, [isActive, timeout, onIdle]);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Initialize timer
    resetTimer();

    // DOM Events to track activity
    const events = ['touchstart', 'pointermove', 'keydown', 'click'];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isActive, resetTimer]);
}
