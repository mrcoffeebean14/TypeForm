/**
 * Registry of app-wide UI themes (product chrome: landing, dashboard, builder,
 * results). Single source of truth for the theme picker menu.
 *
 * Each `id` must match a `[data-theme="..."]` block in app/globals.css, and the
 * swatch colors here are only for rendering the menu preview.
 *
 * Distinct from the per-form themes in components/builder/ThemePanel.tsx, which
 * style a published form for its respondents.
 */

export interface AppTheme {
  id: string;
  label: string;
  /** Menu swatch: accent half + surface half. */
  swatch: { accent: string; surface: string };
  /** Grouping in the picker. */
  group: "base" | "color";
}

export const APP_THEMES: AppTheme[] = [
  { id: "light", label: "Light", swatch: { accent: "#0445AF", surface: "#FFFFFF" }, group: "base" },
  { id: "dark", label: "Dark", swatch: { accent: "#608DE8", surface: "#171717" }, group: "base" },
  { id: "indigo", label: "Indigo", swatch: { accent: "#4F46E5", surface: "#F8F8FF" }, group: "color" },
  { id: "teal", label: "Teal", swatch: { accent: "#0D9488", surface: "#F0FDFA" }, group: "color" },
  { id: "sunset", label: "Sunset", swatch: { accent: "#EA580C", surface: "#FFF7ED" }, group: "color" },
  { id: "midnight", label: "Midnight", swatch: { accent: "#818CF8", surface: "#0F172A" }, group: "color" },
];

/** Theme ids passed to next-themes. */
export const APP_THEME_IDS = APP_THEMES.map((t) => t.id);

export const DEFAULT_APP_THEME = "light";

export function findTheme(id: string | undefined): AppTheme {
  return APP_THEMES.find((t) => t.id === id) ?? APP_THEMES[0];
}
