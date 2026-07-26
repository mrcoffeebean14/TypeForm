"use client";

import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Logo } from "@/components/Logo";
import { FormCard } from "@/components/dashboard/FormCard";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { api } from "@/lib/api";
import { useForms, useInvalidateForms } from "@/lib/hooks";
import type { FormSummary } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { data: forms, isLoading } = useForms();
  const invalidate = useInvalidateForms();

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

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Logo href="/dashboard" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={() => { setNewTitle(""); setCreateOpen(true); }}>
              <Plus size={16} /> Create form
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">My forms</h1>
          <p className="mt-1 text-sm text-ink-faint">
            Build, publish, and collect responses — the Typeform way.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-surface-2" />
            ))}
          </div>
        ) : forms && forms.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => { setNewTitle(""); setCreateOpen(true); }}
              className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line text-ink-faint transition hover:border-accent hover:text-accent"
            >
              <Plus size={28} />
              <span className="text-sm font-medium">New form</span>
            </button>
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onRename={(f) => { setRenameTarget(f); setRenameValue(f.title); }}
                onDuplicate={(f) => duplicateMutation.mutate(f.id)}
                onDelete={(f) => setDeleteTarget(f)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line py-24 text-center">
            <div className="text-5xl">✨</div>
            <h2 className="mt-4 text-lg font-medium">No forms yet</h2>
            <p className="mt-1 text-sm text-ink-faint">Create your first form to get started.</p>
            <Button className="mt-5" onClick={() => setCreateOpen(true)}>
              <Plus size={16} /> Create form
            </Button>
          </div>
        )}
      </main>

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
