"""Server-side answer validation, mirrored by the client for instant feedback."""
from __future__ import annotations

import re
from typing import Any

from ..models import Question, QuestionType

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ValidationError(Exception):
    def __init__(self, question_id: str, message: str):
        self.question_id = question_id
        self.message = message
        super().__init__(message)


def _is_empty(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        return value.strip() == ""
    if isinstance(value, (list, dict)):
        return len(value) == 0
    return False


def validate_answer(question: Question, value: Any) -> Any:
    """Validate and normalize a single answer for a question.

    Returns the (possibly coerced) value or raises ValidationError.
    Empty values for optional questions are allowed and returned as-is.
    """
    if _is_empty(value):
        if question.required:
            raise ValidationError(question.id, "This question is required.")
        return value

    qtype = question.type

    if qtype in (QuestionType.short_text, QuestionType.long_text):
        return str(value)

    if qtype == QuestionType.email:
        text = str(value).strip()
        if not EMAIL_RE.match(text):
            raise ValidationError(question.id, "Please enter a valid email address.")
        return text

    if qtype == QuestionType.number:
        try:
            num = float(value)
        except (TypeError, ValueError):
            raise ValidationError(question.id, "Please enter a valid number.")
        settings = question.settings or {}
        minimum = settings.get("number_min")
        maximum = settings.get("number_max")
        if minimum is not None and num < minimum:
            raise ValidationError(question.id, f"Must be at least {minimum}.")
        if maximum is not None and num > maximum:
            raise ValidationError(question.id, f"Must be at most {maximum}.")
        return int(num) if num.is_integer() else num

    if qtype == QuestionType.rating:
        settings = question.settings or {}
        rating_max = settings.get("rating_max", 5)
        try:
            rating = int(value)
        except (TypeError, ValueError):
            raise ValidationError(question.id, "Please choose a rating.")
        if not 1 <= rating <= rating_max:
            raise ValidationError(question.id, f"Rating must be between 1 and {rating_max}.")
        return rating

    if qtype == QuestionType.yes_no:
        if isinstance(value, bool):
            return value
        text = str(value).strip().lower()
        if text in ("yes", "true", "1"):
            return True
        if text in ("no", "false", "0"):
            return False
        raise ValidationError(question.id, "Please choose yes or no.")

    if qtype in (QuestionType.multiple_choice, QuestionType.dropdown):
        valid_values = {opt.value for opt in question.options}
        allow_multiple = (question.settings or {}).get("allow_multiple", False)
        if allow_multiple:
            selected = value if isinstance(value, list) else [value]
            for item in selected:
                if item not in valid_values:
                    raise ValidationError(question.id, "Invalid option selected.")
            return selected
        choice = value[0] if isinstance(value, list) else value
        if choice not in valid_values:
            raise ValidationError(question.id, "Invalid option selected.")
        return choice

    return value
