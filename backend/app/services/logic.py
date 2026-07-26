"""Server-side branching evaluation, mirroring frontend/lib/logic.ts.

Used at submission time to determine which questions the respondent actually
reached, so ``required`` is only enforced on questions on their branch path
(a rule that jumps past a required question must not block the submission).
"""
from __future__ import annotations

from typing import Any

from ..models import Question


def _matches(rule: dict, value: Any) -> bool:
    operator = rule.get("operator")
    target = rule.get("value")
    if operator == "equals":
        if isinstance(value, list):
            return target in value
        return str(value) == str(target)
    if operator == "not_equals":
        if isinstance(value, list):
            return target not in value
        return str(value) != str(target)
    if operator in ("greater_than", "less_than"):
        try:
            num, ref = float(value), float(target)
        except (TypeError, ValueError):
            return False
        return num > ref if operator == "greater_than" else num < ref
    return False


def _resolve_next_index(question: Question, value: Any, index_by_id: dict[str, int]) -> int | None:
    """Return the next index to jump to, -1 for end, or None to fall through."""
    for rule in question.logic or []:
        if _matches(rule, value):
            goto = rule.get("goto")
            if goto == "end":
                return -1
            idx = index_by_id.get(goto)
            if idx is not None:
                return idx
    return None


def reachable_question_ids(questions: list[Question], answers: dict[str, Any]) -> set[str]:
    """Walk the form the way the respondent did, following branching jumps."""
    reachable: set[str] = set()
    if not questions:
        return reachable
    index_by_id = {q.id: i for i, q in enumerate(questions)}
    i = 0
    # Bound iterations by question count to guard against cyclic logic.
    for _ in range(len(questions) + 1):
        if not 0 <= i < len(questions):
            break
        q = questions[i]
        reachable.add(q.id)
        nxt = _resolve_next_index(q, answers.get(q.id), index_by_id)
        if nxt == -1:
            break
        i = nxt if nxt is not None else i + 1
    return reachable
