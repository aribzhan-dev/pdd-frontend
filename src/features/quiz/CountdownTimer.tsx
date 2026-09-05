// Countdown for the timed exam mode.
//
// The remaining time comes from the server, so a reload picks the clock up
// where it stood rather than restarting it. Ticking is local from that point;
// when it reaches zero the parent is told, and the run is handed in.

import { useEffect, useRef, useState } from "react";

import { useStrings } from "@/i18n/LanguageContext";

const TICK_MS = 1000;

/** "38:12" from a number of seconds. */
function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

interface CountdownTimerProps {
  /** Seconds left when the session was last read from the server. */
  secondsLeft: number;
  onExpire: () => void;
}

export function CountdownTimer({ secondsLeft, onExpire }: CountdownTimerProps) {
  const t = useStrings();
  const [remaining, setRemaining] = useState(secondsLeft);
  // Keep the latest callback without restarting the interval on every render.
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setRemaining(secondsLeft);
  }, [secondsLeft]);

  useEffect(() => {
    const handle = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(handle);
          onExpireRef.current();
          return 0;
        }
        return current - 1;
      });
    }, TICK_MS);
    return () => window.clearInterval(handle);
  }, []);

  const isUrgent = remaining <= 60;

  return (
    <span className={`timer ${isUrgent ? "timer--urgent" : ""}`}>
      {remaining === 0 ? t.timeIsUp : `${t.timeLeft} ${formatClock(remaining)}`}
    </span>
  );
}
