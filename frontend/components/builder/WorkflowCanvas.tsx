"use client";

import { AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";

import { END_ID, GAP_X, NODE_H, NODE_W, buildFlow, type FlowEdge, type FlowNode } from "@/lib/flowLayout";
import { QUESTION_META } from "@/lib/questionMeta";
import type { Question } from "@/lib/types";
import { cn, questionLetter } from "@/lib/utils";

interface WorkflowCanvasProps {
  questions: Question[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// Vertical room above/below the row for the jump arcs to bow into.
const PAD_TOP = 150;
const PAD_BOTTOM = 150;
const PAD_X = 48;

const ROW_Y = PAD_TOP;
const MID_Y = ROW_Y + NODE_H / 2;

// Tokens resolve per theme (see tailwind.config.ts / globals.css). SVG stroke
// attributes can't use Tailwind's color classes, so reference the vars directly.
const C_FAINT = "rgb(var(--text-faint))";
const C_ACCENT = "rgb(var(--accent))";
const C_BG = "rgb(var(--bg))";

const centerX = (n: FlowNode) => n.x + NODE_W / 2;

/** Bow height grows with how far the jump reaches, so long arcs clear short ones. */
const bowHeight = (span: number) => Math.min(120, 44 + 16 * Math.abs(span));

export function WorkflowCanvas({ questions, selectedId, onSelect }: WorkflowCanvasProps) {
  const flow = buildFlow(questions);
  const nodeById = new Map(flow.nodes.map((n) => [n.id, n]));

  const dangling = flow.nodes.reduce((sum, n) => sum + n.danglingRules, 0);
  const loops = flow.nodes.filter((n) => n.loopTarget).length;
  const jumps = flow.edges.filter((e) => e.kind === "jump").length;

  if (questions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-ink-faint">
        Add a question on the Create tab to see your flow here.
      </div>
    );
  }

  const height = PAD_TOP + NODE_H + PAD_BOTTOM;
  const width = flow.width + PAD_X * 2;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-4 py-2.5 text-xs">
        <span className="font-semibold uppercase tracking-wide text-ink-faint">Flow</span>
        <span className="flex items-center gap-1.5 text-ink-soft">
          <CheckCircle2 size={13} className="text-success" />
          {questions.length} {questions.length === 1 ? "question" : "questions"}, {jumps}{" "}
          {jumps === 1 ? "jump" : "jumps"}
        </span>
        {loops > 0 && (
          <span className="flex items-center gap-1.5 text-ink-soft">
            <RotateCcw size={13} className="text-ink-faint" />
            {loops} {loops === 1 ? "question can" : "questions can"} be revisited
          </span>
        )}
        {dangling > 0 && (
          <span className="flex items-center gap-1.5 text-danger">
            <AlertTriangle size={13} />
            {dangling} {dangling === 1 ? "rule points" : "rules point"} at a deleted question and
            {dangling === 1 ? " is" : " are"} ignored
          </span>
        )}
      </div>

      <div className="flex flex-1 items-center overflow-auto">
        <div className="relative shrink-0" style={{ width, height }}>
          <svg width={width} height={height} className="absolute inset-0" aria-hidden>
            <defs>
              <Arrowhead id="wf-arrow" color={C_FAINT} />
              <Arrowhead id="wf-arrow-accent" color={C_ACCENT} />
            </defs>
            <g transform={`translate(${PAD_X}, 0)`}>
              {flow.edges.map((edge, i) => (
                <Edge key={i} edge={edge} nodeById={nodeById} />
              ))}
            </g>
          </svg>

          {flow.nodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              selected={node.id === selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Arrowhead({ id, color }: { id: string; color: string }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto-start-reverse"
    >
      <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
    </marker>
  );
}

function Edge({ edge, nodeById }: { edge: FlowEdge; nodeById: Map<string, FlowNode> }) {
  const from = nodeById.get(edge.from);
  const to = nodeById.get(edge.to);
  if (!from || !to) return null;

  if (edge.kind === "default") {
    // Neighbours in the row: a straight hop from one card's right edge to the
    // next card's left edge.
    return (
      <line
        x1={from.x + NODE_W}
        y1={MID_Y}
        x2={to.x - 6}
        y2={MID_Y}
        stroke={C_FAINT}
        strokeWidth={1.5}
        markerEnd="url(#wf-arrow)"
      />
    );
  }

  const sx = centerX(from);
  const tx = centerX(to);
  const y = edge.backward ? ROW_Y + NODE_H : ROW_Y;
  const dir = edge.backward ? 1 : -1;
  const h = bowHeight((tx - sx) / (NODE_W + GAP_X)) * dir;
  const labelY = y + h * 0.78;

  return (
    <g>
      <path
        d={`M ${sx} ${y} C ${sx} ${y + h}, ${tx} ${y + h}, ${tx} ${y + dir * 6}`}
        fill="none"
        stroke={C_ACCENT}
        strokeWidth={1.5}
        strokeDasharray="5 4"
        markerEnd="url(#wf-arrow-accent)"
      />
      {edge.label && (
        <text
          x={(sx + tx) / 2}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={11}
          fill={C_ACCENT}
          // Halo so the label stays legible where it crosses its own dashes.
          stroke={C_BG}
          strokeWidth={6}
          paintOrder="stroke"
        >
          {edge.label}
        </text>
      )}
    </g>
  );
}

function NodeCard({
  node,
  selected,
  onSelect,
}: {
  node: FlowNode;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const isEnd = node.id === END_ID;
  const Icon = node.type ? QUESTION_META[node.type].icon : null;

  const style = {
    left: node.x + PAD_X,
    top: node.y + ROW_Y,
    width: NODE_W,
    height: NODE_H,
  } as const;

  if (isEnd) {
    return (
      <div
        style={style}
        className="absolute flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface-2 px-3 text-center"
      >
        <span className="text-sm font-medium text-ink-soft">End</span>
        <span className="text-xs text-ink-faint">Thank-you screen</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      style={style}
      onClick={() => onSelect(node.id)}
      className={cn(
        "absolute flex flex-col justify-center gap-1.5 rounded-xl border bg-surface px-3 text-left shadow-sm transition",
        selected ? "border-accent ring-2 ring-accent/30" : "border-line hover:border-accent/60",
      )}
    >
      <span className="flex items-center gap-1.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-surface-2 text-[10px] font-semibold text-ink-soft">
          {questionLetter(node.index)}
        </span>
        {Icon && <Icon size={13} className="shrink-0 text-ink-faint" />}
        {node.loopTarget && <RotateCcw size={12} className="shrink-0 text-ink-faint" />}
        {node.danglingRules > 0 && <AlertTriangle size={12} className="shrink-0 text-danger" />}
      </span>
      <span className="truncate text-sm text-ink">{node.title}</span>
    </button>
  );
}
