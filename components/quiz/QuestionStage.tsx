"use client";
import type { AnswerValue, QuizQuestion } from "@/lib/quiz/types";
import SingleChoice from "./inputs/SingleChoice";
import MultiChoice from "./inputs/MultiChoice";
import BooleanChoice from "./inputs/BooleanChoice";
import FillInput from "./inputs/FillInput";
import OrderList from "./inputs/OrderList";
import SnippetPick from "./inputs/SnippetPick";
import MatchPairs from "./inputs/MatchPairs";
import HotspotCode from "./inputs/HotspotCode";
import OutputInput from "./inputs/OutputInput";

const difficultyBadge: Record<QuizQuestion["difficulty"], string> = {
  easy: "bg-blue-50 text-blue-600",
  medium: "bg-purple-50 text-purple-600",
  hard: "bg-red-50 text-red-600",
};

export default function QuestionStage({
  question,
  index,
  total,
  value,
  onChange,
  disabled,
  showHint,
}: {
  question: QuizQuestion;
  index: number;
  total: number;
  value: AnswerValue | null;
  onChange: (v: AnswerValue) => void;
  disabled?: boolean;
  showHint?: boolean;
}) {
  return (
    <div className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Question {index + 1} / {total}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${difficultyBadge[question.difficulty]}`}
        >
          {question.difficulty}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold capitalize text-slate-600">
          {question.topic}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">
          {question.type}
        </span>
      </div>
      <h2 className="text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
        {question.prompt}
      </h2>
      {showHint && question.hint && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Hint: {question.hint}
        </p>
      )}
      <div className="mt-6">
        {question.type === "single" && (
          <SingleChoice
            options={question.options}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        )}
        {question.type === "multi" && (
          <MultiChoice
            options={question.options}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        )}
        {question.type === "boolean" && (
          <BooleanChoice value={value} onChange={onChange} disabled={disabled} />
        )}
        {question.type === "fill" && (
          <FillInput
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={question.placeholder}
          />
        )}
        {question.type === "order" && (
          <OrderList
            items={question.items}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        )}
        {question.type === "snippet" && (
          <SnippetPick
            snippets={question.snippets}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        )}
        {question.type === "match" && (
          <MatchPairs
            left={question.left}
            right={question.right}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        )}
        {question.type === "hotspot" && (
          <HotspotCode
            code={question.code}
            regions={question.regions}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        )}
        {question.type === "output" && (
          <OutputInput
            code={question.code}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}
