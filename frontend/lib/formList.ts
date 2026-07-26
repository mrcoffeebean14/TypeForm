// Search + sort for the dashboard form list. Pure, no runtime imports, so it
// runs under `node --test --experimental-strip-types` (see formList.test.ts).
import type { FormSummary } from "./types";

export type SortKey = "created" | "updated" | "title" | "responses";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "created", label: "Date created" },
  { value: "updated", label: "Last updated" },
  { value: "title", label: "Name" },
  { value: "responses", label: "Responses" },
];

function compare(a: FormSummary, b: FormSummary, sort: SortKey): number {
  switch (sort) {
    case "title":
      return a.title.localeCompare(b.title);
    case "responses":
      return b.response_count - a.response_count;
    case "updated":
      return Date.parse(b.updated_at) - Date.parse(a.updated_at);
    default:
      return Date.parse(b.created_at) - Date.parse(a.created_at);
  }
}

/**
 * Filter by title then sort. Copies before sorting — the input is React Query's
 * cached array, and sorting it in place would mutate cache state.
 */
export function visibleForms(
  forms: FormSummary[],
  query: string,
  sort: SortKey,
): FormSummary[] {
  const needle = query.trim().toLowerCase();
  const matched = needle
    ? forms.filter((f) => f.title.toLowerCase().includes(needle))
    : forms;
  return [...matched].sort((a, b) => compare(a, b, sort));
}
