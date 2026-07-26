// Shared types mirroring the FastAPI Pydantic schemas.

export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "dropdown"
  | "email"
  | "number"
  | "yes_no"
  | "rating";

export type FormStatus = "draft" | "published";

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  position: number;
}

export interface OptionInput {
  id?: string;
  label: string;
  value?: string;
}

export interface QuestionSettings {
  placeholder?: string;
  rating_max?: number;
  number_min?: number;
  number_max?: number;
  allow_multiple?: boolean;
}

// A single branching rule: if the answer matches, jump to a target question or end.
export interface LogicRule {
  operator: "equals" | "not_equals" | "greater_than" | "less_than";
  value: string | number | boolean;
  goto: string; // question id or "end"
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string | null;
  required: boolean;
  position: number;
  settings: QuestionSettings;
  logic: LogicRule[];
  options: QuestionOption[];
}

export interface FormTheme {
  primary?: string;
  background?: string;
  questionColor?: string;
  answerColor?: string;
  font?: string;
  mode?: "light" | "dark";
}

export interface FormSettings {
  welcome?: { enabled: boolean; title: string; buttonText: string };
  thankYou?: { title: string; description: string };
}

export interface Form {
  id: string;
  title: string;
  description?: string | null;
  status: FormStatus;
  public_slug?: string | null;
  theme: FormTheme;
  settings: FormSettings;
  created_at: string;
  updated_at: string;
  questions: Question[];
}

export interface FormSummary {
  id: string;
  title: string;
  description?: string | null;
  status: FormStatus;
  public_slug?: string | null;
  response_count: number;
  completed_count: number;
  question_count: number;
  created_at: string;
  updated_at: string;
}

export interface Creator {
  id: string;
  name: string;
  email: string;
}

export interface PublicForm {
  id: string;
  title: string;
  description?: string | null;
  theme: FormTheme;
  settings: FormSettings;
  questions: Question[];
}

export interface AnswerValue {
  question_id: string;
  value: unknown;
}

export interface ResponseRecord {
  id: string;
  is_complete: boolean;
  started_at: string;
  submitted_at?: string | null;
  answers: AnswerValue[];
}

export interface QuestionStat {
  question_id: string;
  title: string;
  type: QuestionType;
  answered: number;
  breakdown: Record<string, number> & { average?: number; count?: number };
}

export interface FormSummaryStats {
  form_id: string;
  total_responses: number;
  completed_responses: number;
  completion_rate: number;
  questions: QuestionStat[];
}
