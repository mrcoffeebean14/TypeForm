"use client";

import { Plus, X } from "lucide-react";

import type { LogicRule, Question } from "@/lib/types";

interface LogicEditorProps {
  question: Question;
  allQuestions: Question[];
  onChange: (logic: LogicRule[]) => void;
}

const OPERATORS: { value: LogicRule["operator"]; label: string }[] = [
  { value: "equals", label: "is" },
  { value: "not_equals", label: "is not" },
  { value: "greater_than", label: "greater than" },
  { value: "less_than", label: "less than" },
];

/**
 * Conditional branching editor (bonus). Each rule jumps to another question or
 * the end of the form when the answer matches, evaluated top-to-bottom.
 */
export function LogicEditor({ question, allQuestions, onChange }: LogicEditorProps) {
  const rules = question.logic || [];
  const laterQuestions = allQuestions.filter((q) => q.id !== question.id);
  const hasOptions = question.options.length > 0;

  const updateRule = (index: number, patch: Partial<LogicRule>) => {
    onChange(rules.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const addRule = () => {
    const defaultValue = hasOptions ? question.options[0].value : "";
    onChange([...rules, { operator: "equals", value: defaultValue, goto: "end" }]);
  };

  const removeRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      {rules.length === 0 && (
        <p className="text-xs text-ink-faint">
          No branching. The form advances to the next question by default.
        </p>
      )}

      {rules.map((rule, i) => (
        <div key={i} className="rounded-lg border border-neutral-200 p-2.5 text-sm dark:border-neutral-700">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-ink-faint">If answer</span>
            <button onClick={() => removeRule(i)} className="text-ink-faint hover:text-red-500" aria-label="Remove rule">
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <select
              value={rule.operator}
              onChange={(e) => updateRule(i, { operator: e.target.value as LogicRule["operator"] })}
              className="rounded border border-neutral-200 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            >
              {OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>

            {hasOptions ? (
              <select
                value={String(rule.value)}
                onChange={(e) => updateRule(i, { value: e.target.value })}
                className="rounded border border-neutral-200 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              >
                {question.options.map((opt) => (
                  <option key={opt.id} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={String(rule.value)}
                onChange={(e) => updateRule(i, { value: e.target.value })}
                placeholder="value"
                className="rounded border border-neutral-200 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              />
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-faint">jump to</span>
              <select
                value={rule.goto}
                onChange={(e) => updateRule(i, { goto: e.target.value })}
                className="flex-1 rounded border border-neutral-200 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              >
                {laterQuestions.map((q, idx) => (
                  <option key={q.id} value={q.id}>
                    {q.title || `Question ${idx + 1}`}
                  </option>
                ))}
                <option value="end">End (thank-you screen)</option>
              </select>
            </div>
          </div>
        </div>
      ))}

      <button onClick={addRule} className="flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
        <Plus size={14} /> Add rule
      </button>
    </div>
  );
}
