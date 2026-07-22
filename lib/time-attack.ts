export function parseTimeLimit(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
  return n;
}

export function clampMinutes(m: number): number {
  if (!Number.isFinite(m)) return 1;
  return Math.min(180, Math.max(1, Math.round(m)));
}

export function minutesToSeconds(m: number): number {
  return clampMinutes(m) * 60;
}

export function remainingSeconds(
  startedAtMs: number,
  limitSeconds: number,
  nowMs: number = Date.now()
): number {
  const elapsed = Math.floor((nowMs - startedAtMs) / 1000);
  return Math.max(0, limitSeconds - elapsed);
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function timeAttackStorageKey(sessionId: string): string {
  return `time-attack:${sessionId}`;
}

export type StoredClock = {
  startedAt: number;
  limitSeconds: number;
};

export function readStoredClock(
  storage: Storage,
  sessionId: string,
  limitSeconds: number
): StoredClock {
  const key = timeAttackStorageKey(sessionId);
  try {
    const raw = storage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredClock;
      if (
        parsed &&
        parsed.limitSeconds === limitSeconds &&
        typeof parsed.startedAt === "number"
      ) {
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  const fresh = { startedAt: Date.now(), limitSeconds };
  storage.setItem(key, JSON.stringify(fresh));
  return fresh;
}
