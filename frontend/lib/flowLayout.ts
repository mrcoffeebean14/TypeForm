// Turns a form's questions + branching rules into a positioned node graph for
// the Workflow canvas. Pure: no React, no runtime imports — so it runs directly
// under `node --test --experimental-strip-types` (see flowLayout.test.ts).
import type { LogicRule, Question } from "./types";

export const NODE_W = 208;
export const NODE_H = 88;
export const GAP_X = 72;

/** Terminal node id. Matches the `goto: "end"` sentinel used by LogicRule. */
export const END_ID = "end";

// Operator wording, shared with LogicEditor so the canvas labels an arrow with
// the exact phrasing the rule was authored in.
export const OPERATORS: { value: LogicRule["operator"]; label: string }[] = [
  { value: "equals", label: "is" },
  { value: "not_equals", label: "is not" },
  { value: "greater_than", label: "greater than" },
  { value: "less_than", label: "less than" },
];

export interface FlowNode {
  id: string;
  /** 0-based question index; -1 for the End node. */
  index: number;
  title: string;
  type: Question["type"] | null; // null on the End node
  x: number;
  y: number;
  /**
   * Rules on this question whose target no longer exists. resolveNextIndex()
   * ignores them, so they are silently dead — worth showing on the canvas.
   */
  danglingRules: number;
  /** This question can be re-entered by a jump from itself or a later one. */
  loopTarget: boolean;
}

export interface FlowEdge {
  from: string;
  to: string; // question id or END_ID
  kind: "default" | "jump";
  label?: string;
  /** Jump pointing at an earlier-or-same question — drawn below the row. */
  backward: boolean;
}

export interface Flow {
  nodes: FlowNode[];
  edges: FlowEdge[];
  width: number;
}

function ruleLabel(rule: LogicRule): string {
  const op = OPERATORS.find((o) => o.value === rule.operator)?.label ?? rule.operator;
  return `${op} "${rule.value}"`;
}

/**
 * Every question falls through to the next one when no rule matches, so a
 * question is never truly unreachable and there is nothing to compute there.
 * What *can* go wrong and is worth surfacing: rules pointing at a deleted
 * question (silently ignored at runtime) and backward jumps (re-entry).
 */
export function buildFlow(questions: Question[]): Flow {
  const indexById = new Map(questions.map((q, i) => [q.id, i]));
  const dangling = new Map<string, number>();
  const loopTargets = new Set<string>();
  const edges: FlowEdge[] = [];

  questions.forEach((q, i) => {
    for (const rule of q.logic || []) {
      const targetIndex = rule.goto === END_ID ? questions.length : indexById.get(rule.goto);
      if (targetIndex === undefined) {
        dangling.set(q.id, (dangling.get(q.id) ?? 0) + 1);
        continue;
      }
      const backward = targetIndex <= i;
      if (backward) loopTargets.add(rule.goto);
      edges.push({ from: q.id, to: rule.goto, kind: "jump", label: ruleLabel(rule), backward });
    }
    edges.push({
      from: q.id,
      to: i + 1 < questions.length ? questions[i + 1].id : END_ID,
      kind: "default",
      backward: false,
    });
  });

  const nodes: FlowNode[] = questions.map((q, i) => ({
    id: q.id,
    index: i,
    title: q.title || `Question ${i + 1}`,
    type: q.type,
    x: i * (NODE_W + GAP_X),
    y: 0,
    danglingRules: dangling.get(q.id) ?? 0,
    loopTarget: loopTargets.has(q.id),
  }));

  nodes.push({
    id: END_ID,
    index: -1,
    title: "End",
    type: null,
    x: questions.length * (NODE_W + GAP_X),
    y: 0,
    danglingRules: 0,
    loopTarget: false,
  });

  return { nodes, edges, width: (questions.length + 1) * (NODE_W + GAP_X) - GAP_X };
}
