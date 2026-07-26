"use client";

import { Plus, X } from "lucide-react";

import type { QuestionOption } from "@/lib/types";
import { questionLetter } from "@/lib/utils";

interface OptionsEditorProps {
  options: QuestionOption[];
  onChange: (options: { id?: string; label: string; value?: string }[]) => void;
}

export function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  const update = (index: number, label: string) => {
    const next = options.map((o, i) => (i === index ? { ...o, label } : o));
    onChange(next.map((o) => ({ label: o.label })));
  };

  const add = () => {
    onChange([...options.map((o) => ({ label: o.label })), { label: `Option ${options.length + 1}` }]);
  };

  const remove = (index: number) => {
    onChange(options.filter((_, i) => i !== index).map((o) => ({ label: o.label })));
  };

  return (
    <div className="flex flex-col gap-2">
      {options.map((opt, i) => (
        <div key={opt.id || i} className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-surface-2 text-xs font-semibold text-ink-faint">
            {questionLetter(i)}
          </span>
          <input
            value={opt.label}
            onChange={(e) => update(i, e.target.value)}
            className="tf-field flex-1 rounded-lg px-3 py-1.5 text-sm"
          />
          <button
            onClick={() => remove(i)}
            disabled={options.length <= 1}
            className="rounded p-1 text-ink-faint transition hover:bg-danger/10 hover:text-danger disabled:opacity-30"
            aria-label="Remove option"
          >
            <X size={15} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="mt-1 flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
      >
        <Plus size={14} /> Add option
      </button>
    </div>
  );
}
