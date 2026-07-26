// Client-side answer validation, mirroring app/services/validation.py so the
// respondent gets instant feedback before the server re-checks on submit.
import type { Question } from "./types";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/** Returns an error message string, or null if the answer is valid. */
export function validateAnswer(question: Question, value: unknown): string | null {
  if (isEmpty(value)) {
    return question.required ? "This question is required." : null;
  }

  switch (question.type) {
    case "email":
      return EMAIL_RE.test(String(value).trim()) ? null : "Please enter a valid email address.";
    case "number": {
      const num = Number(value);
      if (Number.isNaN(num)) return "Please enter a valid number.";
      const { number_min, number_max } = question.settings;
      if (number_min != null && num < number_min) return `Must be at least ${number_min}.`;
      if (number_max != null && num > number_max) return `Must be at most ${number_max}.`;
      return null;
    }
    case "rating": {
      const max = question.settings.rating_max ?? 5;
      const r = Number(value);
      return r >= 1 && r <= max ? null : `Please choose a rating.`;
    }
    default:
      return null;
  }
}
