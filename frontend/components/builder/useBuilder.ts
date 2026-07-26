"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { api } from "@/lib/api";
import { QUESTION_META } from "@/lib/questionMeta";
import type { Form, FormTheme, OptionInput, Question, QuestionType } from "@/lib/types";

type SaveState = "idle" | "saving" | "saved";

/**
 * Builder state manager: holds the full form locally for instant preview and
 * syncs edits to the backend. Field edits are debounced; structural changes
 * (add/delete/reorder/publish) persist immediately.
 */
export function useBuilder(formId: string) {
  const [form, setForm] = useState<Form | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [loading, setLoading] = useState(true);

  // Debounce timers keyed by target ("form" or a question id).
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    let active = true;
    api
      .getForm(formId)
      .then((f) => {
        if (!active) return;
        setForm(f);
        setSelectedId(f.questions[0]?.id ?? null);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Could not load form");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [formId]);

  const markSaved = () => {
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 1200);
  };

  const debounce = (key: string, fn: () => Promise<unknown>, delay = 600) => {
    setSaveState("saving");
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => {
      fn().then(markSaved).catch(() => toast.error("Save failed"));
    }, delay);
  };

  // ---- Form-level ----
  const updateFormMeta = (patch: Partial<Pick<Form, "title" | "description">>) => {
    setForm((f) => (f ? { ...f, ...patch } : f));
    debounce("form", () => api.updateForm(formId, patch));
  };

  const updateTheme = (patch: Partial<FormTheme>) => {
    setForm((f) => (f ? { ...f, theme: { ...f.theme, ...patch } } : f));
    debounce("theme", () => api.updateForm(formId, { theme: patch }), 300);
  };

  const updateSettings = (patch: Partial<Form["settings"]>) => {
    setForm((f) => (f ? { ...f, settings: { ...f.settings, ...patch } } : f));
    debounce("settings", () => api.updateForm(formId, { settings: patch }), 300);
  };

  // ---- Questions ----
  const addQuestion = async (type: QuestionType) => {
    const meta = QUESTION_META[type];
    setSaveState("saving");
    try {
      const q = await api.addQuestion(formId, {
        type,
        title: "",
        required: false,
        settings: { ...meta.defaultSettings },
        options: meta.defaultOptions ? [...meta.defaultOptions] : [],
      });
      setForm((f) => (f ? { ...f, questions: [...f.questions, q] } : f));
      setSelectedId(q.id);
      markSaved();
    } catch {
      toast.error("Could not add question");
    }
  };

  const updateQuestion = (id: string, patch: Partial<Question>) => {
    setForm((f) =>
      f ? { ...f, questions: f.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)) } : f,
    );
    // Only send serializable fields the API accepts.
    const payload: Record<string, unknown> = {};
    for (const key of ["type", "title", "description", "required", "settings", "logic"] as const) {
      if (key in patch) payload[key] = patch[key];
    }
    if (patch.options) {
      payload.options = patch.options.map((o) => ({ label: o.label, value: o.value }));
    }
    debounce(id, () => api.updateQuestion(id, payload));
  };

  const updateOptions = (id: string, options: OptionInput[]) => {
    setForm((f) =>
      f
        ? {
            ...f,
            questions: f.questions.map((q) =>
              q.id === id
                ? {
                    ...q,
                    options: options.map((o, i) => ({
                      id: o.id || `tmp-${i}`,
                      label: o.label,
                      value: o.value || o.label,
                      position: i,
                    })),
                  }
                : q,
            ),
          }
        : f,
    );
    debounce(id, () => api.updateQuestion(id, { options }));
  };

  const deleteQuestion = async (id: string) => {
    const prev = form;
    setForm((f) => (f ? { ...f, questions: f.questions.filter((q) => q.id !== id) } : f));
    if (selectedId === id) {
      const remaining = form?.questions.filter((q) => q.id !== id) ?? [];
      setSelectedId(remaining[0]?.id ?? null);
    }
    try {
      await api.deleteQuestion(id);
      toast.success("Question deleted");
    } catch {
      setForm(prev);
      toast.error("Could not delete question");
    }
  };

  const reorderQuestions = async (orderedIds: string[]) => {
    setForm((f) => {
      if (!f) return f;
      const byId = new Map(f.questions.map((q) => [q.id, q]));
      const reordered = orderedIds
        .map((id, i) => {
          const q = byId.get(id);
          return q ? { ...q, position: i } : null;
        })
        .filter(Boolean) as Question[];
      return { ...f, questions: reordered };
    });
    try {
      await api.reorderQuestions(formId, orderedIds);
    } catch {
      toast.error("Could not reorder");
    }
  };

  // ---- Publish ----
  const publish = async () => {
    try {
      const updated = await api.publishForm(formId);
      setForm((f) => (f ? { ...f, status: updated.status, public_slug: updated.public_slug } : f));
      toast.success("Form published 🎉");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not publish");
    }
  };

  const unpublish = async () => {
    try {
      const updated = await api.unpublishForm(formId);
      setForm((f) => (f ? { ...f, status: updated.status } : f));
      toast.success("Form unpublished");
    } catch {
      toast.error("Could not unpublish");
    }
  };

  const selected = form?.questions.find((q) => q.id === selectedId) ?? null;

  return {
    form,
    loading,
    selected,
    selectedId,
    setSelectedId,
    saveState,
    updateFormMeta,
    updateTheme,
    updateSettings,
    addQuestion,
    updateQuestion,
    updateOptions,
    deleteQuestion,
    reorderQuestions,
    publish,
    unpublish,
  };
}
