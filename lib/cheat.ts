/** Query flag: `cheat=1` / `cheat=true` / `cheat=yes` enables answer reveal. */
export function parseCheat(raw: string | null): boolean {
  if (raw == null || raw === "") return false;
  const v = raw.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}
