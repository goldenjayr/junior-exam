export type QuizTopic =
  | "javascript"
  | "typescript"
  | "tailwind"
  | "react"
  | "html"
  | "nodejs";

export type QuizDifficulty = "easy" | "medium" | "hard";

export type QuizMode = "assessment" | "practice";

type Base = {
  id: number;
  topic: QuizTopic;
  difficulty: QuizDifficulty;
  prompt: string;
  hint?: string;
  explanation?: string;
};

export type Labeled = { id: string; label: string };

export type QuizQuestion =
  | (Base & {
      type: "single";
      options: Labeled[];
      correctId: string;
    })
  | (Base & {
      type: "multi";
      options: Labeled[];
      correctIds: string[];
    })
  | (Base & {
      type: "boolean";
      correct: boolean;
    })
  | (Base & {
      type: "fill";
      accept: string[];
      placeholder?: string;
    })
  | (Base & {
      type: "order";
      items: Labeled[];
      correctOrder: string[];
    })
  | (Base & {
      type: "snippet";
      snippets: { id: string; code: string }[];
      correctId: string;
    })
  | (Base & {
      type: "match";
      left: Labeled[];
      right: Labeled[];
      pairs: Record<string, string>;
    })
  | (Base & {
      type: "hotspot";
      code: string;
      regions: {
        id: string;
        label: string;
        startLine: number;
        endLine: number;
      }[];
      correctRegionId: string;
    })
  | (Base & {
      type: "output";
      code: string;
      accept: string[];
    });

export type AnswerValue =
  | { type: "single"; id: string }
  | { type: "multi"; ids: string[] }
  | { type: "boolean"; value: boolean }
  | { type: "fill"; text: string }
  | { type: "order"; order: string[] }
  | { type: "snippet"; id: string }
  | { type: "match"; pairs: Record<string, string> }
  | { type: "hotspot"; regionId: string }
  | { type: "output"; text: string };

export type AnswerEntry = {
  value: AnswerValue | null;
  locked: boolean;
  graded?: { correct: boolean };
};
