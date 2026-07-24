"use client";

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { sql, PostgreSQL } from "@codemirror/lang-sql";

export type EditorLanguage = "javascript" | "sql" | "prisma";

export default function CodeEditor({
  value,
  onChange,
  readOnly = false,
  language = "javascript",
}: {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  language?: EditorLanguage;
}) {
  const extensions = useMemo(() => {
    if (language === "sql") return [sql({ dialect: PostgreSQL })];
    if (language === "prisma") return []; // plain text v1
    return [javascript({ jsx: true })];
  }, [language]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700">
      <CodeMirror
        value={value}
        height="380px"
        minHeight="380px"
        theme="dark"
        extensions={extensions}
        basicSetup
        indentWithTab
        readOnly={readOnly}
        editable={!readOnly}
        onChange={onChange}
        aria-label="Code editor"
        className="text-sm"
      />
    </div>
  );
}
