"use client";

import type { Form, FormTheme } from "@/lib/types";

interface ThemePanelProps {
  form: Form;
  onUpdateTheme: (patch: Partial<FormTheme>) => void;
  onUpdateSettings: (patch: Partial<Form["settings"]>) => void;
}

const PRESETS: { name: string; theme: Partial<FormTheme> }[] = [
  { name: "Typeform Blue", theme: { primary: "#0445AF", answerColor: "#0445AF", background: "#FFFFFF", questionColor: "#0A0A0A", mode: "light" } },
  { name: "Indigo", theme: { primary: "#4F46E5", answerColor: "#4F46E5", background: "#F8F8FF", questionColor: "#1E1B4B", mode: "light" } },
  { name: "Teal", theme: { primary: "#0D9488", answerColor: "#0D9488", background: "#F0FDFA", questionColor: "#134E4A", mode: "light" } },
  { name: "Sunset", theme: { primary: "#EA580C", answerColor: "#EA580C", background: "#FFF7ED", questionColor: "#431407", mode: "light" } },
  { name: "Midnight", theme: { primary: "#818CF8", answerColor: "#818CF8", background: "#0F172A", questionColor: "#F1F5F9", mode: "dark" } },
  { name: "Rose", theme: { primary: "#E11D48", answerColor: "#E11D48", background: "#FFF1F2", questionColor: "#4C0519", mode: "light" } },
];

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between text-sm">
      {label}
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border border-line bg-transparent"
        />
        <span className="w-16 font-mono text-xs text-ink-faint">{value}</span>
      </span>
    </label>
  );
}

export function ThemePanel({ form, onUpdateTheme, onUpdateSettings }: ThemePanelProps) {
  const theme = form.theme || {};
  const thankYou = form.settings?.thankYou || { title: "", description: "" };

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-line-subtle px-4 py-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onUpdateTheme(preset.theme)}
              className="flex items-center gap-2 rounded-lg border border-line p-2 text-left text-xs transition hover:border-accent"
            >
              <span
                className="h-6 w-6 shrink-0 rounded-full ring-1 ring-black/10"
                style={{ background: `linear-gradient(135deg, ${preset.theme.primary} 50%, ${preset.theme.background} 50%)` }}
              />
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-line-subtle px-4 py-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">Colors</h3>
        <div className="flex flex-col gap-3">
          <ColorRow label="Accent" value={theme.answerColor || "#0445AF"} onChange={(v) => onUpdateTheme({ primary: v, answerColor: v })} />
          <ColorRow label="Background" value={theme.background || "#FFFFFF"} onChange={(v) => onUpdateTheme({ background: v })} />
          <ColorRow label="Text" value={theme.questionColor || "#0A0A0A"} onChange={(v) => onUpdateTheme({ questionColor: v })} />
        </div>
      </div>

      <div className="px-4 py-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">Thank-you screen</h3>
        <label className="text-xs text-ink-faint">Title</label>
        <input
          value={thankYou.title}
          onChange={(e) => onUpdateSettings({ thankYou: { ...thankYou, title: e.target.value } })}
          className="tf-field mb-3 mt-1 w-full rounded px-2 py-1.5 text-sm"
        />
        <label className="text-xs text-ink-faint">Message</label>
        <textarea
          value={thankYou.description}
          onChange={(e) => onUpdateSettings({ thankYou: { ...thankYou, description: e.target.value } })}
          rows={2}
          className="tf-field mt-1 w-full resize-none rounded px-2 py-1.5 text-sm"
        />
      </div>
    </div>
  );
}
