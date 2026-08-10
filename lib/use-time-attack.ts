"use client";
import { useEffect, useRef, useState } from "react";
import {
  readStoredClock,
  remainingSeconds,
  timeAttackStorageKey,
  type StoredClock,
} from "@/lib/time-attack";

/**
 * Session countdown that survives refresh via sessionStorage.
 * When limitSeconds is null, timer is disabled.
 */
export function useTimeAttack(
  limitSeconds: number | null,
  sessionId: string
): {
  remaining: number | null;
  frozen: boolean;
  elapsed: number | null;
  resetTimer: () => void;
} {
  const clockRef = useRef<StoredClock | null>(null);
  const [remaining, setRemaining] = useState<number | null>(limitSeconds);
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    if (limitSeconds == null) {
      clockRef.current = null;
      return;
    }
    const clock = readStoredClock(sessionStorage, sessionId, limitSeconds);
    clockRef.current = clock;

    const tick = () => {
      setRemaining(remainingSeconds(clock.startedAt, limitSeconds));
    };
    // Defer first paint sync so we don't setState synchronously in the effect body.
    const immediate = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 250);
    return () => {
      window.clearTimeout(immediate);
      window.clearInterval(id);
    };
  }, [limitSeconds, sessionId, epoch]);

  function resetTimer() {
    if (limitSeconds == null) return;
    sessionStorage.removeItem(timeAttackStorageKey(sessionId));
    setRemaining(limitSeconds);
    setEpoch((n) => n + 1);
  }

  const frozen = limitSeconds != null && remaining === 0;
  const elapsed =
    limitSeconds != null && remaining != null
      ? limitSeconds - remaining
      : null;

  return { remaining, frozen, elapsed, resetTimer };
}
