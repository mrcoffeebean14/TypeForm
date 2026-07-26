"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { QUESTION_META, QUESTION_TYPES } from "@/lib/questionMeta";
import type { Question, QuestionType } from "@/lib/types";
import { cn, questionLetter } from "@/lib/utils";

interface QuestionListProps {
  questions: Question[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (type: QuestionType) => void;
  onDelete: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
}

export function QuestionList({
  questions,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
}: QuestionListProps) {
  const [addOpen, setAddOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      const reordered = arrayMove(questions, oldIndex, newIndex);
      onReorder(reordered.map((q) => q.id));
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Questions</h2>
        <span className="text-xs text-ink-faint">{questions.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-1">
              {questions.map((q, i) => (
                <SortableRow
                  key={q.id}
                  question={q}
                  index={i}
                  selected={q.id === selectedId}
                  onSelect={() => onSelect(q.id)}
                  onDelete={() => onDelete(q.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {questions.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-ink-faint">
            No questions yet. Add your first one below.
          </p>
        )}
      </div>

      <div className="relative border-t border-neutral-200 p-3 dark:border-neutral-800">
        <button
          onClick={() => setAddOpen((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 py-2.5 text-sm font-medium text-ink-soft transition hover:border-accent hover:text-accent dark:border-neutral-700"
        >
          <Plus size={16} /> Add question
        </button>

        {addOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setAddOpen(false)} />
            <div className="absolute bottom-16 left-3 right-3 z-20 grid grid-cols-2 gap-1 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
              {QUESTION_TYPES.map((meta) => {
                const Icon = meta.icon;
                return (
                  <button
                    key={meta.type}
                    onClick={() => {
                      onAdd(meta.type);
                      setAddOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <Icon size={16} className="text-accent" />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SortableRow({
  question,
  index,
  selected,
  onSelect,
  onDelete,
}: {
  question: Question;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });
  const Icon = QUESTION_META[question.type].icon;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group flex items-center gap-2 rounded-lg border px-2 py-2 text-sm transition",
        selected
          ? "border-accent bg-accent/5"
          : "border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800",
        isDragging && "opacity-60 shadow-lg",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-neutral-300 hover:text-neutral-500 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>
      <button onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-neutral-100 text-xs font-semibold text-ink-soft dark:bg-neutral-700">
          {questionLetter(index)}
        </span>
        <Icon size={14} className="shrink-0 text-ink-faint" />
        <span className="truncate">{question.title || "Untitled question"}</span>
      </button>
      <button
        onClick={onDelete}
        className="shrink-0 rounded p-1 text-ink-faint opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-900/30"
        aria-label="Delete question"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
