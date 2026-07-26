"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { LayoutGrid, List, Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { DashboardTopBar, InertItem } from "@/components/dashboard/DashboardShell";
import { FormCard } from "@/components/dashboard/FormCard";
import { FormTable } from "@/components/dashboard/FormTable";
import { TemplateCards } from "@/components/dashboard/TemplateCards";
import { WorkspaceSidebar } from "@/components/dashboard/WorkspaceSidebar";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { SORT_OPTIONS, visibleForms, type SortKey } from "@/lib/formList";
import type { FormTemplate } from "@/lib/formTemplates";
import { useForms, useInvalidateForms } from "@/lib/hooks";
import { QUESTION_META } from "@/lib/questionMeta";
import type { FormSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { data: forms, isLoading } = useForms();
  const { data: creator } = useQuery({ queryKey: ["me"], queryFn: api.getMe });
  const invalidate = useInvalidateForms();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("created");
  const [view, setView] = useState<"list" | "grid">("list");

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [renameTarget, setRenameTarget] = useState<FormSummary | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<FormSummary | null>(null);

  const createMutation = useMutation({
    mutationFn: (title: string) => api.createForm({ title: title || "Untitled form" }),
    onSuccess: (form) => {
      toast.success("Form created");
      router.push(`/forms/${form.id}/edit`);
    },
    onError: () => toast.error("Could not create form"),
  });

  const templateMutation = useMutation({
    mutationFn: async (template: FormTemplate) => {
      const form = await api.createForm({
        title: template.title,
        description: template.description,
      });
      // Sequential on purpose: the server assigns position from max(position)+1,
      // so parallel creates would collide on the same position.
      for (const q of template.questions) {
        await api.addQuestion(form.id, {
          type: q.type,
          title: q.title,
          required: q.required ?? false,
          settings: { ...QUESTION_META[q.type].defaultSettings },
          options: q.options?.map((label) => ({ label })),
        });
      }
      return form;
    },
    onSuccess: (form) => {
      toast.success("Form created from template");
      router.push(`/forms/${form.id}/edit`);
    },
    onError: () => toast.error("Could not create form from template"),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => api.updateForm(id, { title }),
    onSuccess: () => {
      toast.success("Renamed");
      invalidate();
      setRenameTarget(null);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => api.duplicateForm(id),
    onSuccess: () => {
      toast.success("Form duplicated");
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteForm(id),
    onSuccess: () => {
      toast.success("Form deleted");
      invalidate();
    },
  });

  const openCreate = () => {
    setNewTitle("");
    setCreateOpen(true);
  };

  const all = forms ?? [];
  const shown = visibleForms(all, query, sort);
  const responsesCollected = all.reduce((sum, f) => sum + f.response_count, 0);

  const actions = {
    onRename: (f: FormSummary) => {
      setRenameTarget(f);
      setRenameValue(f.title);
    },
    onDuplicate: (f: FormSummary) => duplicateMutation.mutate(f.id),
    onDelete: (f: FormSummary) => setDeleteTarget(f),
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg">
      <DashboardTopBar creator={creator} />

      <div className="flex flex-1 overflow-hidden">
        <WorkspaceSidebar
          formCount={all.length}
          responsesCollected={responsesCollected}
          query={query}
          onQueryChange={setQuery}
          onCreate={openCreate}
        />

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight">My workspace</h1>
              <InertItem
                icon={Users}
                label="Invite"
                href="/coming-soon/invite"
                className="rounded-lg border border-line"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort forms"
                className="tf-field tf-focus rounded-lg px-2.5 py-1.5 text-sm"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center rounded-lg border border-line p-0.5">
                <ViewButton active={view === "list"} onClick={() => setView("list")} icon={List} label="List" />
                <ViewButton active={view === "grid"} onClick={() => setView("grid")} icon={LayoutGrid} label="Grid" />
              </div>
            </div>
          </div>

          <TemplateCards
            onUse={(t) => templateMutation.mutate(t)}
            pendingId={templateMutation.isPending ? templateMutation.variables?.id ?? null : null}
          />

          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-surface-2" />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <EmptyState hasForms={all.length > 0} query={query} onCreate={openCreate} />
          ) : view === "list" ? (
            <FormTable forms={shown} {...actions} />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((form) => (
                <FormCard key={form.id} form={form} {...actions} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create a new form"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(newTitle)} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create"}
            </Button>
          </>
        }
      >
        <label className="mb-1.5 block text-sm font-medium">Form title</label>
        <input
          autoFocus
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !createMutation.isPending && createMutation.mutate(newTitle)}
          placeholder="e.g. Customer feedback survey"
          className="tf-field tf-focus w-full rounded-lg px-3 py-2 text-sm"
        />
      </Modal>

      {/* Rename modal */}
      <Modal
        open={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        title="Rename form"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button
              onClick={() => renameTarget && renameMutation.mutate({ id: renameTarget.id, title: renameValue })}
            >
              Save
            </Button>
          </>
        }
      >
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && renameTarget && !renameMutation.isPending && renameMutation.mutate({ id: renameTarget.id, title: renameValue })}
          className="tf-field tf-focus w-full rounded-lg px-3 py-2 text-sm"
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete form?"
        message={`"${deleteTarget?.title}" and all of its responses will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof List;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition",
        active ? "bg-surface-2 text-ink" : "text-ink-faint hover:text-ink",
      )}
    >
      <Icon size={15} /> {label}
    </button>
  );
}

function EmptyState({
  hasForms,
  query,
  onCreate,
}: {
  hasForms: boolean;
  query: string;
  onCreate: () => void;
}) {
  if (hasForms) {
    return (
      <div className="rounded-2xl border border-dashed border-line py-16 text-center">
        <p className="text-sm text-ink-faint">
          No forms match “{query.trim()}”.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line py-20 text-center">
      <div className="text-5xl">✨</div>
      <h2 className="mt-4 text-lg font-medium">No forms yet</h2>
      <p className="mt-1 text-sm text-ink-faint">Create your first form to get started.</p>
      <Button className="mt-5" onClick={onCreate}>
        <Plus size={16} /> Create form
      </Button>
    </div>
  );
}
