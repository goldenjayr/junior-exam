export type QuizPromptPart =
  | { type: "text"; text: string }
  | { type: "code"; lang?: string; code: string };

/** Split a quiz prompt into plain text and fenced ``` code blocks. */
export function parseQuizPrompt(prompt: string): QuizPromptPart[] {
  const parts: QuizPromptPart[] = [];
  const re = /```(\w*)\r?\n([\s\S]*?)```/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(prompt)) !== null) {
    if (match.index > last) {
      parts.push({ type: "text", text: prompt.slice(last, match.index) });
    }
    parts.push({
      type: "code",
      lang: match[1] || undefined,
      code: match[2].replace(/\r?\n$/, ""),
    });
    last = match.index + match[0].length;
  }
  if (last < prompt.length) {
    parts.push({ type: "text", text: prompt.slice(last) });
  }
  if (!parts.length) {
    parts.push({ type: "text", text: prompt });
  }
  return parts;
}
