"use client";

/**
 * Renders the interactive input for a single question. Shared by the builder's
 * live preview and the public respondent flow so the two never diverge.
 *
 * `accent` drives all themeable colors (custom themes). `onEnter` lets the
 * respondent flow advance with the keyboard.
 */
import { Check } from "lucide-react";
import { useEffect, useRef } from "react";

import type { Question } from "@/lib/types";
import { questionLetter } from "@/lib/utils";

interface FieldProps {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
  onEnter?: () => void;
  accent: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function QuestionField(props: FieldProps) {
  switch (props.question.type) {
    case "short_text":
    case "email":
      return <TextField {...props} />;
    case "number":
      return <TextField {...props} numeric />;
    case "long_text":
      return <TextArea {...props} />;
    case "multiple_choice":
      return <ChoiceField {...props} />;
    case "dropdown":
      return <DropdownField {...props} />;
    case "yes_no":
      return <YesNoField {...props} />;
    case "rating":
      return <RatingField {...props} />;
    default:
      return null;
  }
}

const inputBase =
  "w-full bg-transparent text-2xl md:text-3xl font-light outline-none placeholder:text-current placeholder:opacity-30 border-b-2 pb-2 transition-colors";

function TextField({ question, value, onChange, onEnter, accent, autoFocus, disabled, numeric }: FieldProps & { numeric?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  return (
    <input
      ref={ref}
      type={numeric ? "number" : question.type === "email" ? "email" : "text"}
      inputMode={numeric ? "decimal" : undefined}
      disabled={disabled}
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onEnter) {
          e.preventDefault();
          onEnter();
        }
      }}
      placeholder={question.settings.placeholder || "Type your answer here..."}
      className={inputBase}
      style={{ borderColor: `${accent}66`, caretColor: accent }}
      onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
      onBlur={(e) => (e.currentTarget.style.borderColor = `${accent}66`)}
    />
  );
}

function TextArea({ question, value, onChange, onEnter, accent, autoFocus, disabled }: FieldProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  return (
    <textarea
      ref={ref}
      rows={2}
      disabled={disabled}
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        // Shift+Enter for newline; Enter advances.
        if (e.key === "Enter" && !e.shiftKey && onEnter) {
          e.preventDefault();
          onEnter();
        }
      }}
      placeholder={question.settings.placeholder || "Type your answer here..."}
      className={`${inputBase} resize-none`}
      style={{ borderColor: `${accent}66`, caretColor: accent }}
      onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
      onBlur={(e) => (e.currentTarget.style.borderColor = `${accent}66`)}
    />
  );
}

function ChoiceField({ question, value, onChange, accent, disabled }: FieldProps) {
  const multiple = !!question.settings.allow_multiple;
  const selected: string[] = Array.isArray(value) ? value : value != null ? [value as string] : [];

  const toggle = (optValue: string) => {
    if (disabled) return;
    if (multiple) {
      onChange(selected.includes(optValue) ? selected.filter((v) => v !== optValue) : [...selected, optValue]);
    } else {
      onChange(optValue);
    }
  };

  // Keyboard: press the letter key to toggle an option.
  useEffect(() => {
    if (disabled) return;
    const onKey = (e: KeyboardEvent) => {
      const idx = e.key.toUpperCase().charCodeAt(0) - 65;
      if (idx >= 0 && idx < question.options.length && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        toggle(question.options[idx].value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.options, selected, disabled]);

  return (
    <div className="flex flex-col gap-3">
      {question.options.map((opt, i) => {
        const isSelected = selected.includes(opt.value);
        return (
          <button
            key={opt.id || i}
            type="button"
            disabled={disabled}
            onClick={() => toggle(opt.value)}
            className="group flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left text-lg font-normal transition-all"
            style={{
              borderColor: isSelected ? accent : `${accent}55`,
              backgroundColor: isSelected ? `${accent}1A` : `${accent}0D`,
            }}
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded border text-sm font-medium"
              style={{
                borderColor: `${accent}88`,
                backgroundColor: isSelected ? accent : "transparent",
                color: isSelected ? "#fff" : "inherit",
              }}
            >
              {isSelected ? <Check size={15} /> : questionLetter(i)}
            </span>
            <span>{opt.label}</span>
          </button>
        );
      })}
      {multiple && <p className="mt-1 text-xs opacity-50">Choose as many as you like</p>}
    </div>
  );
}

function DropdownField({ question, value, onChange, accent, disabled }: FieldProps) {
  return (
    <select
      disabled={disabled}
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border-2 bg-transparent px-4 py-3 text-xl font-light outline-none"
      style={{ borderColor: `${accent}66` }}
    >
      <option value="" disabled>
        Select an option…
      </option>
      {question.options.map((opt, i) => (
        <option key={opt.id || i} value={opt.value} className="text-black">
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function YesNoField({ value, onChange, accent, disabled }: FieldProps) {
  const options = [
    { label: "Yes", val: true, key: "Y" },
    { label: "No", val: false, key: "N" },
  ];

  useEffect(() => {
    if (disabled) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.key.toLowerCase() === "y") onChange(true);
      if (e.key.toLowerCase() === "n") onChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [disabled, onChange]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {options.map((opt) => {
        const isSelected = value === opt.val;
        return (
          <button
            key={opt.label}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.val)}
            className="flex items-center gap-3 rounded-lg border-2 px-5 py-3 text-lg transition-all sm:min-w-[9rem]"
            style={{
              borderColor: isSelected ? accent : `${accent}55`,
              backgroundColor: isSelected ? `${accent}1A` : `${accent}0D`,
            }}
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded border text-sm font-medium"
              style={{
                borderColor: `${accent}88`,
                backgroundColor: isSelected ? accent : "transparent",
                color: isSelected ? "#fff" : "inherit",
              }}
            >
              {opt.key}
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function RatingField({ question, value, onChange, accent, disabled }: FieldProps) {
  const max = question.settings.rating_max ?? 5;
  const current = Number(value) || 0;

  useEffect(() => {
    if (disabled) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= max) onChange(n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [max, disabled, onChange]);

  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: max }).map((_, i) => {
        const n = i + 1;
        const active = n <= current;
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(n)}
            className="flex h-14 w-14 items-center justify-center rounded-lg border-2 text-xl font-medium transition-all"
            style={{
              borderColor: active ? accent : `${accent}55`,
              backgroundColor: active ? accent : `${accent}0D`,
              color: active ? "#fff" : "inherit",
            }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
