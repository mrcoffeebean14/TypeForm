// Typed fetch client for the FastAPI backend.
import type {
  Form,
  FormSummary,
  FormSummaryStats,
  OptionInput,
  PublicForm,
  Question,
  QuestionType,
  ResponseRecord,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, detail: unknown, message: string) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    let detail: unknown = null;
    try {
      detail = (await res.json()).detail;
    } catch {
      /* ignore non-JSON error bodies */
    }
    const message =
      typeof detail === "string"
        ? detail
        : detail && typeof detail === "object" && "message" in (detail as object)
          ? String((detail as { message: unknown }).message)
          : `Request failed (${res.status})`;
    throw new ApiError(res.status, detail, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  base: BASE,

  // ---- Forms (creator) ----
  listForms: () => request<FormSummary[]>("/api/forms"),
  getForm: (id: string) => request<Form>(`/api/forms/${id}`),
  createForm: (data: { title?: string; description?: string }) =>
    request<Form>("/api/forms", { method: "POST", body: JSON.stringify(data) }),
  updateForm: (
    id: string,
    data: Partial<Pick<Form, "title" | "description" | "theme" | "settings">>,
  ) => request<Form>(`/api/forms/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteForm: (id: string) => request<{ detail: string }>(`/api/forms/${id}`, { method: "DELETE" }),
  duplicateForm: (id: string) => request<Form>(`/api/forms/${id}/duplicate`, { method: "POST" }),
  publishForm: (id: string) => request<Form>(`/api/forms/${id}/publish`, { method: "POST" }),
  unpublishForm: (id: string) => request<Form>(`/api/forms/${id}/unpublish`, { method: "POST" }),

  // ---- Questions ----
  addQuestion: (
    formId: string,
    data: {
      type: QuestionType;
      title?: string;
      description?: string | null;
      required?: boolean;
      settings?: Question["settings"];
      logic?: Question["logic"];
      options?: OptionInput[];
    },
  ) =>
    request<Question>(`/api/forms/${formId}/questions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateQuestion: (
    questionId: string,
    data: Partial<{
      type: QuestionType;
      title: string;
      description: string | null;
      required: boolean;
      settings: Question["settings"];
      logic: Question["logic"];
      options: OptionInput[];
    }>,
  ) =>
    request<Question>(`/api/questions/${questionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteQuestion: (questionId: string) =>
    request<{ detail: string }>(`/api/questions/${questionId}`, { method: "DELETE" }),
  reorderQuestions: (formId: string, questionIds: string[]) =>
    request<Question[]>(`/api/forms/${formId}/questions/reorder`, {
      method: "PUT",
      body: JSON.stringify({ question_ids: questionIds }),
    }),

  // ---- Public respondent ----
  getPublicForm: (slug: string) => request<PublicForm>(`/api/public/forms/${slug}`),
  startResponse: (slug: string) =>
    request<{ response_id: string }>(`/api/public/forms/${slug}/responses/start`, {
      method: "POST",
    }),
  patchResponse: (responseId: string, answers: { question_id: string; value: unknown }[]) =>
    request<{ detail: string }>(`/api/public/responses/${responseId}`, {
      method: "PATCH",
      body: JSON.stringify({ answers }),
    }),
  completeResponse: (responseId: string, answers: { question_id: string; value: unknown }[]) =>
    request<{ detail: string }>(`/api/public/responses/${responseId}/complete`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),

  // ---- Results ----
  listResponses: (formId: string) => request<ResponseRecord[]>(`/api/forms/${formId}/responses`),
  getResponse: (formId: string, responseId: string) =>
    request<ResponseRecord>(`/api/forms/${formId}/responses/${responseId}`),
  getSummary: (formId: string) => request<FormSummaryStats>(`/api/forms/${formId}/summary`),
  exportCsvUrl: (formId: string) => `${BASE}/api/forms/${formId}/responses/export.csv`,
};
