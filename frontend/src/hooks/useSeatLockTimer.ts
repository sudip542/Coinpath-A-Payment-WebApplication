import { useEffect, useState } from "react";

interface UseSeatLockTimerOptions {
  expirationTime: number | null; // Unix timestamp in ms
  onExpire?: () => void;
}

export function useSeatLockTimer({ expirationTime, onExpire }: UseSeatLockTimerOptions) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (!expirationTime) {
      setSecondsLeft(0);
      return;
    }

    const updateTimer = () => {
      const diff = Math.max(0, Math.floor((expirationTime - Date.now()) / 1000));
      setSecondsLeft(diff);

      if (diff === 0) {
        onExpire?.();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expirationTime, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const remainingSeconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;

  return {
    secondsLeft,
    formattedTime,
    isExpired: secondsLeft === 0 && Boolean(expirationTime),
  };
}
