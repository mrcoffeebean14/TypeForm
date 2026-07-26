// Per-question-type presentation metadata and factory defaults.
import {
  AlignLeft,
  AtSign,
  CheckSquare,
  ChevronDownSquare,
  Hash,
  Star,
  ToggleRight,
  Type,
  type LucideIcon,
} from "lucide-react";

import type { OptionInput, QuestionSettings, QuestionType } from "./types";

interface QuestionTypeMeta {
  type: QuestionType;
  label: string;
  icon: LucideIcon;
  hasOptions: boolean;
  defaultSettings: QuestionSettings;
  defaultOptions?: OptionInput[];
}

export const QUESTION_TYPES: QuestionTypeMeta[] = [
  { type: "short_text", label: "Short text", icon: Type, hasOptions: false, defaultSettings: { placeholder: "Type your answer here..." } },
  { type: "long_text", label: "Long text", icon: AlignLeft, hasOptions: false, defaultSettings: { placeholder: "Type your answer here..." } },
  {
    type: "multiple_choice",
    label: "Multiple choice",
    icon: CheckSquare,
    hasOptions: true,
    defaultSettings: { allow_multiple: false },
    defaultOptions: [{ label: "Option 1" }, { label: "Option 2" }, { label: "Option 3" }],
  },
  {
    type: "dropdown",
    label: "Dropdown",
    icon: ChevronDownSquare,
    hasOptions: true,
    defaultSettings: {},
    defaultOptions: [{ label: "Choice 1" }, { label: "Choice 2" }, { label: "Choice 3" }],
  },
  { type: "email", label: "Email", icon: AtSign, hasOptions: false, defaultSettings: { placeholder: "name@example.com" } },
  { type: "number", label: "Number", icon: Hash, hasOptions: false, defaultSettings: {} },
  { type: "yes_no", label: "Yes / No", icon: ToggleRight, hasOptions: false, defaultSettings: {} },
  { type: "rating", label: "Rating", icon: Star, hasOptions: false, defaultSettings: { rating_max: 5 } },
];

export const QUESTION_META: Record<QuestionType, QuestionTypeMeta> = QUESTION_TYPES.reduce(
  (acc, meta) => {
    acc[meta.type] = meta;
    return acc;
  },
  {} as Record<QuestionType, QuestionTypeMeta>,
);

export function questionLabel(type: QuestionType): string {
  return QUESTION_META[type].label;
}
