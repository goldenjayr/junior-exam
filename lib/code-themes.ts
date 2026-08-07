import { oneDark } from "@codemirror/theme-one-dark";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import { dracula } from "@uiw/codemirror-theme-dracula";
import type { Extension } from "@codemirror/state";

export type CodeThemeId =
  | "vscode-dark"
  | "one-dark"
  | "github-dark"
  | "dracula"
  | "github-light";

export const CODE_THEMES: {
  id: CodeThemeId;
  label: string;
  /** Editor / console chrome background */
  bg: string;
  panelBg: string;
  muted: string;
  text: string;
  border: string;
  extension: Extension;
}[] = [
  {
    id: "vscode-dark",
    label: "VS Code Dark",
    bg: "#1e1e1e",
    panelBg: "#252526",
    muted: "#858585",
    text: "#d4d4d4",
    border: "#333333",
    extension: vscodeDark,
  },
  {
    id: "one-dark",
    label: "One Dark",
    bg: "#282c34",
    panelBg: "#21252b",
    muted: "#7f848e",
    text: "#abb2bf",
    border: "#181a1f",
    extension: oneDark,
  },
  {
    id: "github-dark",
    label: "GitHub Dark",
    bg: "#0d1117",
    panelBg: "#010409",
    muted: "#8b949e",
    text: "#c9d1d9",
    border: "#30363d",
    extension: githubDark,
  },
  {
    id: "dracula",
    label: "Dracula",
    bg: "#282a36",
    panelBg: "#21222c",
    muted: "#6272a4",
    text: "#f8f8f2",
    border: "#191a21",
    extension: dracula,
  },
  {
    id: "github-light",
    label: "GitHub Light",
    bg: "#ffffff",
    panelBg: "#f6f8fa",
    muted: "#656d76",
    text: "#1f2328",
    border: "#d0d7de",
    extension: githubLight,
  },
];

export const DEFAULT_CODE_THEME: CodeThemeId = "vscode-dark";
export const CODE_THEME_STORAGE_KEY = "playground:code-theme:v1";

export function getCodeTheme(id: CodeThemeId = DEFAULT_CODE_THEME) {
  return CODE_THEMES.find((t) => t.id === id) ?? CODE_THEMES[0];
}

export function loadCodeThemeId(): CodeThemeId {
  if (typeof window === "undefined") return DEFAULT_CODE_THEME;
  try {
    const raw = localStorage.getItem(CODE_THEME_STORAGE_KEY);
    if (CODE_THEMES.some((t) => t.id === raw)) return raw as CodeThemeId;
  } catch {
    /* ignore */
  }
  return DEFAULT_CODE_THEME;
}

export function saveCodeThemeId(id: CodeThemeId): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CODE_THEME_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}
