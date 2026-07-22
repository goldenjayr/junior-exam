import type { QuizQuestion } from "../types.ts";

export const cssQuestions: QuizQuestion[] = [
  {
    id: 181,
    type: "single",
    topic: "css",
    difficulty: "easy",
    prompt: "What does CSS stand for?",
    options: [
      { id: "a", label: "Cascading Style Sheets" },
      { id: "b", label: "Computer Style Syntax" },
      { id: "c", label: "Creative Styling System" },
      { id: "d", label: "Cascading Script Styles" },
    ],
    correctId: "a",
    explanation: "CSS is Cascading Style Sheets — the cascade resolves which rules win.",
  },
  {
    id: 182,
    type: "single",
    topic: "css",
    difficulty: "easy",
    prompt: "Which property changes text color?",
    options: [
      { id: "a", label: "font-color" },
      { id: "b", label: "text-color" },
      { id: "c", label: "color" },
      { id: "d", label: "foreground" },
    ],
    correctId: "c",
    explanation: "Use `color` for text; `background-color` for the background.",
  },
  {
    id: 183,
    type: "single",
    topic: "css",
    difficulty: "medium",
    prompt: "In the box model, which area sits outside the border?",
    options: [
      { id: "a", label: "padding" },
      { id: "b", label: "margin" },
      { id: "c", label: "content" },
      { id: "d", label: "outline-offset only" },
    ],
    correctId: "b",
    explanation: "Outside → inside: margin, border, padding, content.",
  },
  {
    id: 184,
    type: "single",
    topic: "css",
    difficulty: "medium",
    prompt: "What does `display: flex` primarily enable on a container?",
    options: [
      { id: "a", label: "Grid tracks only" },
      { id: "b", label: "One-dimensional layout of flex items along a main axis" },
      { id: "c", label: "Absolute positioning of all children" },
      { id: "d", label: "Hiding overflow automatically" },
    ],
    correctId: "b",
    explanation: "Flexbox is for one-dimensional layouts (row or column); Grid is two-dimensional.",
  },
  {
    id: 185,
    type: "single",
    topic: "css",
    difficulty: "hard",
    prompt: "Which selector has the highest specificity among these?",
    options: [
      { id: "a", label: ".card p" },
      { id: "b", label: "#header" },
      { id: "c", label: "p" },
      { id: "d", label: "div.card > p" },
    ],
    correctId: "b",
    explanation: "IDs beat classes/elements. `#header` wins over class and element selectors here.",
  },
  {
    id: 186,
    type: "multi",
    topic: "css",
    difficulty: "easy",
    prompt: "Which are valid CSS length units? (select all)",
    options: [
      { id: "a", label: "px" },
      { id: "b", label: "rem" },
      { id: "c", label: "em" },
      { id: "d", label: "ptx" },
      { id: "e", label: "%" },
    ],
    correctIds: ["a", "b", "c", "e"],
    explanation: "`ptx` is not a unit. Common units include `px`, `rem`, `em`, `%`, `vh`, `vw`.",
  },
  {
    id: 187,
    type: "multi",
    topic: "css",
    difficulty: "medium",
    prompt: "Which properties participate in the standard CSS box model size of an element? (select all)",
    options: [
      { id: "a", label: "width / height (content)" },
      { id: "b", label: "padding" },
      { id: "c", label: "border" },
      { id: "d", label: "z-index" },
    ],
    correctIds: ["a", "b", "c"],
    explanation:
      "With `box-sizing: content-box` (default), total size includes content + padding + border. `z-index` is stacking, not box size.",
  },
  {
    id: 188,
    type: "multi",
    topic: "css",
    difficulty: "medium",
    prompt: "Which are valid ways to center a **block-level box** horizontally? (select all)",
    options: [
      { id: "a", label: "margin-left: auto; margin-right: auto; with a set width" },
      { id: "b", label: "text-align: center on the parent" },
      { id: "c", label: "display: flex; justify-content: center on the parent" },
      { id: "d", label: "float: center" },
    ],
    correctIds: ["a", "c"],
    explanation:
      "Auto horizontal margins center a block with a defined width. Flex/grid on the parent can center children. `text-align: center` centers *inline* content, not the block box itself. There is no `float: center`.",
  },
  {
    id: 189,
    type: "boolean",
    topic: "css",
    difficulty: "easy",
    prompt: "Classes can be reused on many elements; IDs should be unique in a document.",
    correct: true,
    explanation: "IDs are unique identifiers; classes group reusable styles.",
  },
  {
    id: 190,
    type: "boolean",
    topic: "css",
    difficulty: "medium",
    prompt: "`position: absolute` elements are always positioned relative to the viewport.",
    correct: false,
    explanation:
      "Absolutely positioned elements are offset from their nearest positioned ancestor (not `static`), or the initial containing block if none.",
  },
  {
    id: 191,
    type: "boolean",
    topic: "css",
    difficulty: "easy",
    prompt: "Media queries can apply styles based on viewport width (e.g. `@media (min-width: 768px)`).",
    correct: true,
    explanation: "Media queries are the foundation of responsive CSS breakpoints.",
  },
  {
    id: 192,
    type: "fill",
    topic: "css",
    difficulty: "easy",
    prompt: "What property sets the space between an element's border and its content?",
    accept: ["padding"],
    placeholder: "property name",
    explanation: "Padding is inside the border; margin is outside.",
  },
  {
    id: 193,
    type: "fill",
    topic: "css",
    difficulty: "medium",
    prompt: "Complete: `box-sizing: ____;` makes width/height include padding and border.",
    accept: ["border-box"],
    placeholder: "border-box",
    explanation: "`border-box` is widely used so declared width matches the visible box size.",
  },
  {
    id: 194,
    type: "fill",
    topic: "css",
    difficulty: "medium",
    prompt: "What pseudo-class styles a link while the pointer is over it? (include the colon, e.g. `:name`)",
    accept: [":hover"],
    placeholder: ":hover",
    explanation: "`:hover` matches when the user hovers; also useful with `:focus-visible` for keyboard users.",
  },
  {
    id: 195,
    type: "order",
    topic: "css",
    difficulty: "medium",
    prompt: "Order these style origins from lowest to highest priority (simplified cascade):",
    items: [
      { id: "ua", label: "User-agent (browser default) styles" },
      { id: "author", label: "Author normal styles (your stylesheet)" },
      { id: "important", label: "Author !important styles" },
    ],
    correctOrder: ["ua", "author", "important"],
    explanation:
      "Simplified: browser defaults lose to author rules; author `!important` outranks normal author rules (use sparingly).",
  },
  {
    id: 196,
    type: "order",
    topic: "css",
    difficulty: "easy",
    prompt: "Order these box-model layers from outermost to innermost:",
    items: [
      { id: "margin", label: "margin" },
      { id: "border", label: "border" },
      { id: "padding", label: "padding" },
      { id: "content", label: "content" },
    ],
    correctOrder: ["margin", "border", "padding", "content"],
    explanation: "Outside → inside: margin, border, padding, content.",
  },
  {
    id: 197,
    type: "snippet",
    topic: "css",
    difficulty: "easy",
    prompt: "Which snippet correctly selects all paragraphs inside elements with class `card`?",
    snippets: [
      { id: "a", code: `.card p { color: navy; }` },
      { id: "b", code: `card > p { color: navy; }` },
      { id: "c", code: `#card p { color: navy; }` },
    ],
    correctId: "a",
    explanation: "`.card` is a class selector. (b) targets a `<card>` element; (c) is an ID.",
  },
  {
    id: 198,
    type: "snippet",
    topic: "css",
    difficulty: "medium",
    prompt: "Which snippet correctly creates a 3-column CSS Grid?",
    snippets: [
      {
        id: "a",
        code: `.grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n}`,
      },
      {
        id: "b",
        code: `.grid {\n  display: flex;\n  grid-template-columns: 1fr 1fr 1fr;\n}`,
      },
      {
        id: "c",
        code: `.grid {\n  columns: 3fr;\n}`,
      },
    ],
    correctId: "a",
    explanation: "`display: grid` plus `grid-template-columns` defines tracks. Flex does not use that property.",
  },
  {
    id: 199,
    type: "match",
    topic: "css",
    difficulty: "easy",
    prompt: "Match each property to what it controls.",
    left: [
      { id: "display", label: "display" },
      { id: "position", label: "position" },
      { id: "z", label: "z-index" },
      { id: "opacity", label: "opacity" },
    ],
    right: [
      { id: "r1", label: "layout mode (block, flex, grid, …)" },
      { id: "r2", label: "positioning scheme (static, relative, absolute, …)" },
      { id: "r3", label: "stacking order of positioned elements" },
      { id: "r4", label: "transparency of an element" },
    ],
    pairs: { display: "r1", position: "r2", z: "r3", opacity: "r4" },
  },
  {
    id: 200,
    type: "match",
    topic: "css",
    difficulty: "medium",
    prompt: "Match each Flexbox property to its role.",
    left: [
      { id: "jc", label: "justify-content" },
      { id: "ai", label: "align-items" },
      { id: "dir", label: "flex-direction" },
      { id: "gap", label: "gap" },
    ],
    right: [
      { id: "r1", label: "distribution along the main axis" },
      { id: "r2", label: "alignment on the cross axis" },
      { id: "r3", label: "main axis direction (row/column)" },
      { id: "r4", label: "spacing between items" },
    ],
    pairs: { jc: "r1", ai: "r2", dir: "r3", gap: "r4" },
  },
  {
    id: 201,
    type: "hotspot",
    topic: "css",
    difficulty: "medium",
    prompt: "Click the declaration that is invalid / will be ignored.",
    code: `.box {
  color: #333;
  margin: 1rem;
  display: center;
  padding: 8px;
}`,
    regions: [
      { id: "r1", label: "Line 2: color", startLine: 2, endLine: 2 },
      { id: "r2", label: "Line 3: margin", startLine: 3, endLine: 3 },
      { id: "r3", label: "Line 4: display: center", startLine: 4, endLine: 4 },
      { id: "r4", label: "Line 5: padding", startLine: 5, endLine: 5 },
    ],
    correctRegionId: "r3",
    explanation: "`display` does not accept `center`. Use flex/grid with alignment properties to center.",
  },
  {
    id: 202,
    type: "hotspot",
    topic: "css",
    difficulty: "hard",
    prompt: "Click the rule that fails to apply a class selector (typo / wrong combinator intent).",
    code: `/* Goal: style elements with class "btn" */
.btn {
  background: blue;
}
btn {
  color: white;
}
.btn:hover {
  background: navy;
}`,
    regions: [
      { id: "r1", label: "Line 2-4: .btn block", startLine: 2, endLine: 4 },
      { id: "r2", label: "Line 5-7: bare btn element selector", startLine: 5, endLine: 7 },
      { id: "r3", label: "Line 8-10: .btn:hover", startLine: 8, endLine: 10 },
    ],
    correctRegionId: "r2",
    explanation: "`btn` selects a `<btn>` element, not class `btn`. Use `.btn`.",
  },
  {
    id: 203,
    type: "output",
    topic: "css",
    difficulty: "easy",
    prompt: "What color is the text? Answer with the color keyword.",
    code: `p { color: red; }
p { color: blue; }`,
    accept: ["blue"],
    explanation: "When specificity is equal, the later rule in the stylesheet wins (cascade order).",
  },
  {
    id: 204,
    type: "output",
    topic: "css",
    difficulty: "medium",
    prompt: "With default `box-sizing: content-box`, what is the total width in px of this box? (number only)",
    code: `.box {
  width: 100px;
  padding: 10px;
  border: 5px solid black;
}`,
    accept: ["130"],
    explanation: "100 content + 10+10 padding + 5+5 border = 130px total width.",
  },
  {
    id: 205,
    type: "single",
    topic: "css",
    difficulty: "hard",
    prompt: "What is the main purpose of CSS custom properties (variables)?",
    options: [
      { id: "a", label: "Store reusable values (e.g. colors) that can cascade and update at runtime" },
      { id: "b", label: "Replace HTML attributes entirely" },
      { id: "c", label: "Compile TypeScript types into CSS" },
      { id: "d", label: "Disable the cascade for one file" },
    ],
    correctId: "a",
    explanation:
      "Custom properties like `--brand: #06f` are inherited/cascaded and can be read with `var(--brand)`.",
  },
];
