"use client";

import { Check, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

import { APP_THEMES, findTheme } from "@/lib/appThemes";

/**
 * App-wide theme picker. Swaps the design tokens on <html data-theme="...">,
 * which restyles all product chrome (landing, dashboard, builder, results).
 * Published forms keep their own per-form theme and are unaffected.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Placeholder keeps layout stable until the stored theme is known.
  if (!mounted) return <div className="h-9 w-9" />;

  const active = findTheme(theme);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
        aria-label={`Change theme (current: ${active.label})`}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`Theme: ${active.label}`}
      >
        <Palette size={18} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-xl border border-line bg-surface py-1.5 shadow-xl animate-fade-in"
        >
          {APP_THEMES.map((t, i) => {
            const isFirstColor = t.group === "color" && APP_THEMES[i - 1]?.group === "base";
            return (
              <div key={t.id}>
                {isFirstColor && <div className="my-1.5 border-t border-line-subtle" />}
                <button
                  role="menuitemradio"
                  aria-checked={t.id === active.id}
                  onClick={() => {
                    setTheme(t.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-surface-2"
                >
                  <span
                    className="h-5 w-5 shrink-0 rounded-full ring-1 ring-inset ring-black/10"
                    style={{
                      background: `linear-gradient(135deg, ${t.swatch.accent} 50%, ${t.swatch.surface} 50%)`,
                    }}
                  />
                  <span className="flex-1">{t.label}</span>
                  {t.id === active.id && <Check size={15} className="text-accent" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
