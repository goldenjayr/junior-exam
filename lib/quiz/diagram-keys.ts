export const quizDiagramKeys = [
  "request-path",
  "load-balancer",
  "cdn-origin",
  "reverse-proxy",
  "nextjs-layers",
  "ci-cd-pipeline",
  "blue-green",
  "cache-layers",
] as const;

export type QuizDiagramKey = (typeof quizDiagramKeys)[number];
