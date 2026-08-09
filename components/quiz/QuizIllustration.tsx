"use client";

import { createElement } from "react";
import type { QuizIllustration as Illustration } from "@/lib/quiz/types";
import { getQuizDiagram } from "@/lib/quiz/diagrams";

export default function QuizIllustration({
  illustration,
}: {
  illustration: Illustration;
}) {
  if (illustration.kind === "image") {
    return (
      <figure className="mb-5 overflow-hidden rounded-xl border border-border bg-background">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={illustration.src}
          alt={illustration.alt}
          className="mx-auto max-h-64 w-full object-contain p-3"
        />
        {illustration.caption ? (
          <figcaption className="border-t border-border px-3 py-2 text-center text-xs text-subtle">
            {illustration.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  const Diagram = getQuizDiagram(illustration.diagram);
  return (
    <figure className="mb-5 overflow-hidden rounded-xl border border-border bg-background">
      <div className="p-3 sm:p-4">
        {Diagram ? (
          createElement(Diagram, {
            className: "mx-auto h-auto w-full max-w-xl",
            blankFocus: illustration.blankFocus,
          })
        ) : (
          <p className="px-2 py-6 text-center text-sm text-subtle">
            {illustration.alt}
          </p>
        )}
      </div>
      {illustration.caption ? (
        <figcaption className="border-t border-border px-3 py-2 text-center text-xs text-subtle">
          {illustration.caption}
        </figcaption>
      ) : null}
      <span className="sr-only">{illustration.alt}</span>
    </figure>
  );
}
