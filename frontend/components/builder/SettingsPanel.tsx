"use client";

import { QUESTION_META } from "@/lib/questionMeta";
import type { OptionInput, Question } from "@/lib/types";
import { Toggle } from "@/components/ui/Toggle";

import { LogicEditor } from "./LogicEditor";
import { OptionsEditor } from "./OptionsEditor";

interface SettingsPanelProps {
  question: Question | null;
  allQuestions: Question[];
  onUpdate: (patch: Partial<Question>) => void;
  onUpdateOptions: (options: OptionInput[]) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line-subtle px-4 py-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">{title}</h3>
      {children}
    </div>
  );
}

export function SettingsPanel({ question, allQuestions, onUpdate, onUpdateOptions }: SettingsPanelProps) {
  if (!question) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-ink-faint">
        Select a question to edit its settings.
      </div>
    );
  }

  const meta = QUESTION_META[question.type];
  const settings = question.settings || {};

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
          <meta.icon size={13} /> {meta.label}
        </span>
      </div>

      <Section title="General">
        <div className="flex flex-col gap-3">
          <Toggle
            checked={question.required}
            onChange={(v) => onUpdate({ required: v })}
            label="Required"
          />
          <Toggle
            checked={question.description !== null && question.description !== undefined}
            onChange={(v) => onUpdate({ description: v ? "" : null })}
            label="Description"
          />
        </div>
      </Section>

      {meta.hasOptions && (
        <Section title="Options">
          <OptionsEditor options={question.options} onChange={onUpdateOptions} />
          {question.type === "multiple_choice" && (
            <div className="mt-3">
              <Toggle
                checked={!!settings.allow_multiple}
                onChange={(v) => onUpdate({ settings: { ...settings, allow_multiple: v } })}
                label="Allow multiple selections"
              />
            </div>
          )}
        </Section>
      )}

      {question.type === "rating" && (
        <Section title="Rating scale">
          <label className="flex items-center justify-between text-sm">
            Steps
            <select
              value={settings.rating_max ?? 5}
              onChange={(e) => onUpdate({ settings: { ...settings, rating_max: Number(e.target.value) } })}
              className="tf-field rounded px-2 py-1 text-sm"
            >
              {[3, 4, 5, 7, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </Section>
      )}

      {question.type === "number" && (
        <Section title="Number range">
          <div className="flex gap-2">
            <label className="flex-1 text-xs text-ink-faint">
              Min
              <input
                type="number"
                value={settings.number_min ?? ""}
                onChange={(e) =>
                  onUpdate({
                    settings: { ...settings, number_min: e.target.value === "" ? undefined : Number(e.target.value) },
                  })
                }
                className="tf-field mt-1 w-full rounded px-2 py-1.5 text-sm"
              />
            </label>
            <label className="flex-1 text-xs text-ink-faint">
              Max
              <input
                type="number"
                value={settings.number_max ?? ""}
                onChange={(e) =>
                  onUpdate({
                    settings: { ...settings, number_max: e.target.value === "" ? undefined : Number(e.target.value) },
                  })
                }
                className="tf-field mt-1 w-full rounded px-2 py-1.5 text-sm"
              />
            </label>
          </div>
        </Section>
      )}

      {(question.type === "short_text" || question.type === "long_text" || question.type === "email") && (
        <Section title="Placeholder">
          <input
            value={settings.placeholder ?? ""}
            onChange={(e) => onUpdate({ settings: { ...settings, placeholder: e.target.value } })}
            placeholder="Type your answer here..."
            className="tf-field w-full rounded px-2 py-1.5 text-sm"
          />
        </Section>
      )}

      <Section title="Logic jump">
        <LogicEditor
          question={question}
          allQuestions={allQuestions}
          onChange={(logic) => onUpdate({ logic })}
        />
      </Section>
    </div>
  );
}
