"use client";

import { motion } from "framer-motion";
import { ArrowDown, Check } from "lucide-react";

import { QuestionField } from "@/components/fields/QuestionField";
import type { Question } from "@/lib/types";
import { questionLetter } from "@/lib/utils";

interface QuestionScreenProps {
  question: Question;
  index: number;
  total: number;
  value: unknown;
  error: string | null;
  accent: string;
  isLast: boolean;
  onChange: (value: unknown) => void;
  onSubmit: () => void;
}

export function QuestionScreen({
  question,
  index,
  value,
  error,
  accent,
  isLast,
  onChange,
  onSubmit,
}: QuestionScreenProps) {
  // Choice/yes-no/rating advance on click; text types use the button/Enter.
  const advanceOnSelect = ["multiple_choice", "yes_no", "rating", "dropdown"].includes(question.type)
    && !question.settings.allow_multiple;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-24"
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-medium" style={{ color: accent }}>
        <span>{questionLetter(index)}</span>
        <ArrowDown size={14} className="rotate-90" />
      </div>

      <h1 className="text-2xl font-medium leading-snug md:text-3xl">
        {question.title || "Untitled question"}
        {question.required && <span className="ml-1 opacity-40">*</span>}
      </h1>
      {question.description && (
        <p className="mt-2 text-base opacity-60">{question.description}</p>
      )}

      <div className="mt-8">
        <QuestionField
          question={question}
          value={value}
          onChange={(v) => {
            onChange(v);
            if (advanceOnSelect) setTimeout(onSubmit, 250);
          }}
          onEnter={onSubmit}
          accent={accent}
          autoFocus
        />
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium text-white shadow-sm transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: accent }}
        >
          {isLast ? "Submit" : "OK"}
          <Check size={16} />
        </button>
        <span className="text-sm opacity-50">
          press <kbd className="rounded bg-black/10 px-1.5 py-0.5 text-xs">Enter ↵</kbd>
        </span>
      </div>
    </motion.div>
  );
}
