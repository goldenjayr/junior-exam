// Run with: npm test
import assert from "node:assert";
import test from "node:test";
import { parseQuizPrompt } from "./prompt.ts";

test("parseQuizPrompt returns plain text when no fences", () => {
  assert.deepStrictEqual(parseQuizPrompt("Just a question?"), [
    { type: "text", text: "Just a question?" },
  ]);
});

test("parseQuizPrompt extracts a fenced code block", () => {
  const prompt =
    'Order the logs.\n\n```js\nconsole.log("S");\nsetTimeout(() => {}, 0);\n```';
  const parts = parseQuizPrompt(prompt);
  assert.strictEqual(parts.length, 2);
  assert.deepStrictEqual(parts[0], {
    type: "text",
    text: "Order the logs.\n\n",
  });
  assert.strictEqual(parts[1]?.type, "code");
  if (parts[1]?.type === "code") {
    assert.strictEqual(parts[1].lang, "js");
    assert.strictEqual(parts[1].code, 'console.log("S");\nsetTimeout(() => {}, 0);');
  }
});
