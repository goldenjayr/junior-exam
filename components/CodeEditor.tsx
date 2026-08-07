"use client";

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { sql, PostgreSQL } from "@codemirror/lang-sql";
import { python } from "@codemirror/lang-python";
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  lineNumbers,
} from "@codemirror/view";
import type { EditorLanguage } from "@/lib/exam-dispatch";
import {
  DEFAULT_CODE_THEME,
  getCodeTheme,
  type CodeThemeId,
} from "@/lib/code-themes";

export default function CodeEditor({
  value,
  onChange,
  readOnly = false,
  language = "javascript",
  height = "380px",
  fill = false,
  codeTheme = DEFAULT_CODE_THEME,
}: {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  language?: EditorLanguage;
  height?: string;
  fill?: boolean;
  codeTheme?: CodeThemeId;
}) {
  const theme = getCodeTheme(codeTheme);

  const extensions = useMemo(() => {
    const lang =
      language === "sql"
        ? sql({ dialect: PostgreSQL })
        : language === "prisma"
          ? []
          : language === "python"
            ? [python()]
            : language === "typescript"
              ? [javascript({ typescript: true })]
              : [javascript({ jsx: true })];

    return [
      ...(Array.isArray(lang) ? lang : [lang]),
      lineNumbers(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      theme.extension,
      EditorView.lineWrapping,
      EditorView.theme({
        "&": { fontSize: "14px" },
        ".cm-content": {
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          paddingTop: "8px",
          paddingBottom: "8px",
        },
      }),
    ];
  }, [language, theme]);

  return (
    <div
      className={`overflow-hidden ${
        fill
          ? "flex h-full min-h-0 flex-col rounded-none border-0"
          : "rounded-xl border border-border"
      }`}
      style={{ backgroundColor: theme.bg }}
    >
      <CodeMirror
        value={value}
        height={fill ? "100%" : height}
        minHeight={fill ? "100%" : height}
        theme="none"
        extensions={extensions}
        basicSetup={{
          lineNumbers: false,
          highlightActiveLine: false,
          foldGutter: true,
        }}
        indentWithTab
        readOnly={readOnly}
        editable={!readOnly}
        onChange={onChange}
        aria-label="Code editor"
        className={`text-sm ${fill ? "flex min-h-0 flex-1 flex-col [&_.cm-editor]:h-full [&_.cm-editor]:flex-1 [&_.cm-scroller]:flex-1" : ""}`}
      />
    </div>
  );
}
