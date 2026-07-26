// Run: node --test --experimental-strip-types lib/flowLayout.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { buildFlow, END_ID, GAP_X, NODE_W } from "./flowLayout.ts";
import type { LogicRule, Question } from "./types";

function q(id: string, logic: LogicRule[] = []): Question {
  return {
    id,
    type: "short_text",
    title: id,
    required: false,
    position: 0,
    settings: {},
    logic,
    options: [],
  };
}

const pairs = (flow: ReturnType<typeof buildFlow>, kind: "default" | "jump") =>
  flow.edges.filter((e) => e.kind === kind).map((e) => [e.from, e.to]);

test("linear form chains through to End", () => {
  const flow = buildFlow([q("a"), q("b"), q("c")]);
  assert.equal(flow.nodes.length, 4); // 3 questions + End
  assert.deepEqual(pairs(flow, "default"), [["a", "b"], ["b", "c"], ["c", END_ID]]);
  assert.deepEqual(pairs(flow, "jump"), []);
  assert.equal(flow.nodes[2].x, 2 * (NODE_W + GAP_X));
});

test("forward jump keeps its fall-through edge and reads the operator wording", () => {
  const flow = buildFlow([q("a", [{ operator: "equals", value: "x", goto: "c" }]), q("b"), q("c")]);
  // Both paths out of "a" are drawn: the jump AND the default next question.
  assert.deepEqual(pairs(flow, "jump"), [["a", "c"]]);
  assert.deepEqual(pairs(flow, "default")[0], ["a", "b"]);
  const jump = flow.edges.find((e) => e.kind === "jump")!;
  assert.equal(jump.label, 'is "x"');
  assert.equal(jump.backward, false);
});

test("backward jump is marked and flags its target as re-enterable", () => {
  const flow = buildFlow([q("a"), q("b", [{ operator: "not_equals", value: "y", goto: "a" }])]);
  const jump = flow.edges.find((e) => e.kind === "jump")!;
  assert.equal(jump.backward, true);
  assert.equal(jump.label, 'is not "y"');
  assert.equal(flow.nodes[0].loopTarget, true);
  assert.equal(flow.nodes[1].loopTarget, false);
});

test("jump to end targets the End node", () => {
  const flow = buildFlow([q("a", [{ operator: "greater_than", value: 30, goto: END_ID }]), q("b")]);
  assert.deepEqual(pairs(flow, "jump"), [["a", END_ID]]);
  assert.equal(flow.edges.find((e) => e.kind === "jump")!.backward, false);
});

test("rule pointing at a deleted question is counted, not drawn", () => {
  const flow = buildFlow([q("a", [{ operator: "equals", value: "x", goto: "gone" }]), q("b")]);
  assert.deepEqual(pairs(flow, "jump"), []);
  assert.equal(flow.nodes[0].danglingRules, 1);
  assert.equal(flow.nodes[1].danglingRules, 0);
});

test("empty form does not crash", () => {
  const flow = buildFlow([]);
  assert.deepEqual(flow.nodes.map((n) => n.id), [END_ID]);
  assert.deepEqual(flow.edges, []);
});
