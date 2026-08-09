import type { ComponentType } from "react";
import BlueGreen from "@/components/quiz/diagrams/BlueGreen";
import CacheLayers from "@/components/quiz/diagrams/CacheLayers";
import CdnOrigin from "@/components/quiz/diagrams/CdnOrigin";
import CiCdPipeline from "@/components/quiz/diagrams/CiCdPipeline";
import LoadBalancer from "@/components/quiz/diagrams/LoadBalancer";
import NextjsLayers from "@/components/quiz/diagrams/NextjsLayers";
import RequestPath from "@/components/quiz/diagrams/RequestPath";
import ReverseProxy from "@/components/quiz/diagrams/ReverseProxy";
import { quizDiagramKeys, type QuizDiagramKey } from "./diagram-keys";

export { quizDiagramKeys };
export type { QuizDiagramKey };

export const quizDiagrams: Record<
  QuizDiagramKey,
  ComponentType<{ className?: string }>
> = {
  "request-path": RequestPath,
  "load-balancer": LoadBalancer,
  "cdn-origin": CdnOrigin,
  "reverse-proxy": ReverseProxy,
  "nextjs-layers": NextjsLayers,
  "ci-cd-pipeline": CiCdPipeline,
  "blue-green": BlueGreen,
  "cache-layers": CacheLayers,
};

export function getQuizDiagram(key: string) {
  if ((quizDiagramKeys as readonly string[]).includes(key)) {
    return quizDiagrams[key as QuizDiagramKey];
  }
  return undefined;
}
