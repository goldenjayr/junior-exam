/** Query flag: `s=1` / `s=true` enables shuffle. */
export function parseShuffle(raw: string | null): boolean {
  if (raw == null || raw === "") return false;
  const v = raw.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/** Fisher–Yates shuffle (mutates a copy). */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sameIdSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sb = new Set(b);
  return a.every((id) => sb.has(id));
}

/**
 * Returns a per-session stable order for `ids`.
 * When shuffle is on, order is randomized once and stored in sessionStorage
 * so a refresh does not reshuffle mid-attempt.
 */
export function sessionItemOrder(
  storage: Storage,
  sessionKey: string,
  ids: number[],
  shuffle: boolean
): number[] {
  if (!ids.length) return [];
  if (!shuffle) return [...ids];

  const key = `item-order:${sessionKey}`;
  try {
    const raw = storage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as number[];
      if (Array.isArray(parsed) && sameIdSet(parsed, ids)) {
        return parsed;
      }
    }
  } catch {
    /* ignore corrupt storage */
  }

  const ordered = shuffleArray(ids);
  try {
    storage.setItem(key, JSON.stringify(ordered));
  } catch {
    /* ignore quota */
  }
  return ordered;
}
