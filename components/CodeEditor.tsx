"use client";

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

export default function CodeEditor({
  value,
  onChange,
  readOnly = false,
}: {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}) {
  const extensions = useMemo(() => [javascript({ jsx: true })], []);

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
