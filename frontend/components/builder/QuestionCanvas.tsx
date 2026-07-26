"use client";

import { useEffect, useRef } from "react";

import { QuestionField } from "@/components/fields/QuestionField";
import type { Form, Question } from "@/lib/types";
import { questionLetter } from "@/lib/utils";

interface QuestionCanvasProps {
  form: Form;
  question: Question | null;
  index: number;
  onUpdate: (patch: Partial<Question>) => void;
}

/**
 * Center pane: renders the selected question exactly as respondents will see it
 * (via the shared QuestionField), with the title and description editable inline.
 */
export function QuestionCanvas({ form, question, index, onUpdate }: QuestionCanvasProps) {
  const accent = form.theme?.answerColor || form.theme?.primary || "#0445AF";
  const background = form.theme?.background || "#ffffff";
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Autosize the title textarea to its content.
  useEffect(() => {
    const el = titleRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [question?.title, question?.id]);

  if (!question) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center text-ink-faint">
          <p className="text-lg font-medium">No question selected</p>
          <p className="mt-1 text-sm">Add a question or pick one from the left to start editing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center overflow-y-auto p-6">
      <div
        className="relative w-full max-w-xl rounded-2xl px-8 py-14 shadow-sm ring-1 ring-black/5"
        style={{ backgroundColor: background, color: form.theme?.questionColor || "#0A0A0A" }}
      >
        <div className="mb-2 flex items-center gap-2 text-sm font-medium" style={{ color: accent }}>
          {questionLetter(index)} →
        </div>

        <textarea
          ref={titleRef}
          value={question.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Type your question here..."
          rows={1}
          className="w-full resize-none bg-transparent text-2xl font-medium leading-snug outline-none placeholder:opacity-30 md:text-3xl"
        />

        {question.description !== null && question.description !== undefined && (
          <input
            value={question.description ?? ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Add a description (optional)"
            className="mt-2 w-full bg-transparent text-base outline-none placeholder:opacity-30"
            style={{ opacity: 0.7 }}
          />
        )}

        <div className="mt-8 pointer-events-none opacity-95">
          {/* Preview is non-interactive here; real interaction happens in the flow. */}
          <QuestionField
            question={question}
            value={undefined}
            onChange={() => {}}
            accent={accent}
            disabled
          />
        </div>
      </div>
    </div>
  );
}
