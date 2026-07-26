"use client";

import { Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";

import { FORM_TEMPLATES, type FormTemplate } from "@/lib/formTemplates";

interface TemplateCardsProps {
  onUse: (template: FormTemplate) => void;
  pendingId: string | null;
}

export function TemplateCards({ onUse, pendingId }: TemplateCardsProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = FORM_TEMPLATES.filter((t) => !dismissed.includes(t.id));

  if (visible.length === 0) return null;

  return (
    <div className="mb-6 grid gap-3 md:grid-cols-2">
      {visible.map((template) => {
        const pending = pendingId === template.id;
        return (
          <div
            key={template.id}
            className="relative rounded-xl border border-line bg-surface p-4 pr-10"
          >
            <button
              onClick={() => setDismissed((d) => [...d, template.id])}
              className="absolute right-3 top-3 rounded p-1 text-ink-faint transition hover:bg-surface-2 hover:text-ink"
              aria-label={`Dismiss ${template.title}`}
            >
              <X size={15} />
            </button>

            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Sparkles size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-snug text-ink">{template.prompt}</p>
                <button
                  onClick={() => onUse(template)}
                  disabled={pending}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-sm font-medium transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending && <Loader2 size={14} className="animate-spin" />}
                  {pending ? "Creating…" : "Use this form"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
