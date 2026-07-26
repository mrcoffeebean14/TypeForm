// Evaluates conditional branching rules for the respondent flow.
import type { LogicRule, Question } from "./types";

function matches(rule: LogicRule, value: unknown): boolean {
  const answered = value;
  switch (rule.operator) {
    case "equals":
      return Array.isArray(answered)
        ? answered.includes(rule.value as string)
        : String(answered) === String(rule.value);
    case "not_equals":
      return Array.isArray(answered)
        ? !answered.includes(rule.value as string)
        : String(answered) !== String(rule.value);
    case "greater_than":
      return Number(answered) > Number(rule.value);
    case "less_than":
      return Number(answered) < Number(rule.value);
    default:
      return false;
  }
}

/**
 * Resolve the index of the next question given the current question's answer.
 * Returns:
 *  - a question index to jump to,
 *  - -1 to jump straight to the end (thank-you), or
 *  - null to fall through to the natural next question.
 */
export function resolveNextIndex(
  question: Question,
  value: unknown,
  questions: Question[],
): number | null {
  for (const rule of question.logic || []) {
    if (matches(rule, value)) {
      if (rule.goto === "end") return -1;
      const idx = questions.findIndex((q) => q.id === rule.goto);
      if (idx !== -1) return idx;
    }
  }
  return null;
}
