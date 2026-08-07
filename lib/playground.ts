export type PlaygroundLanguage = "javascript" | "typescript" | "python";

export type PlaygroundResult = {
  status: "ok" | "error";
  logs: string[];
  error?: string;
  durationMs?: number;
};

export const PLAYGROUND_LANGUAGES: {
  id: PlaygroundLanguage;
  label: string;
  short: string;
}[] = [
  { id: "javascript", label: "JavaScript", short: "JS" },
  { id: "typescript", label: "TypeScript", short: "TS" },
  { id: "python", label: "Python", short: "PY" },
];

export const STARTERS: Record<PlaygroundLanguage, string> = {
  javascript: `// JavaScript playground — console.log shows up below
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("world"));
`,
  typescript: `// TypeScript playground — types erased, then run
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("world"));
`,
  python: `# Python playground — print() shows up below
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("world"))
`,
};

export const STORAGE_KEY = "playground:drafts:v1";

export type PlaygroundDrafts = Partial<Record<PlaygroundLanguage, string>>;

export function loadDrafts(): PlaygroundDrafts {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PlaygroundDrafts;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveDraft(lang: PlaygroundLanguage, code: string): void {
  if (typeof window === "undefined") return;
  try {
    const next = { ...loadDrafts(), [lang]: code };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export type SharePayload = {
  lang: PlaygroundLanguage;
  code: string;
};

/** Encode share state for the URL hash (no server). */
export function encodeShare(payload: SharePayload): string {
  const json = JSON.stringify({
    l: payload.lang,
    c: payload.code,
  });
  const bytes = new TextEncoder().encode(json);
  return `v1.${toBase64Url(bytes)}`;
}

export function decodeShare(hash: string): SharePayload | null {
  const raw = hash.replace(/^#/, "").trim();
  if (!raw.startsWith("v1.")) return null;
  try {
    const bytes = fromBase64Url(raw.slice(3));
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as { l?: string; c?: string };
    if (
      parsed.l !== "javascript" &&
      parsed.l !== "typescript" &&
      parsed.l !== "python"
    ) {
      return null;
    }
    if (typeof parsed.c !== "string") return null;
    return { lang: parsed.l, code: parsed.c };
  } catch {
    return null;
  }
}

export function codeFor(
  lang: PlaygroundLanguage,
  drafts: PlaygroundDrafts,
  share?: SharePayload | null
): string {
  if (share?.lang === lang) return share.code;
  return drafts[lang] ?? STARTERS[lang];
}
