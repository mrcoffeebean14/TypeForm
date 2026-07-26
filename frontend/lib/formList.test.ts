// Run: node --test --experimental-strip-types lib/formList.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { visibleForms } from "./formList.ts";
import type { FormSummary } from "./types";

function f(
  title: string,
  { created = "2026-01-01", updated = "2026-01-01", responses = 0 } = {},
): FormSummary {
  return {
    id: title,
    title,
    status: "draft",
    response_count: responses,
    completed_count: 0,
    question_count: 0,
    created_at: `${created}T00:00:00`,
    updated_at: `${updated}T00:00:00`,
  };
}

const titles = (list: FormSummary[]) => list.map((x) => x.title);

test("empty query returns everything", () => {
  const forms = [f("Alpha"), f("Beta")];
  assert.equal(visibleForms(forms, "", "title").length, 2);
  assert.equal(visibleForms(forms, "   ", "title").length, 2);
});

test("query filters case-insensitively on a substring", () => {
  const forms = [f("Customer feedback"), f("Job application"), f("FEEDBACK form")];
  assert.deepEqual(titles(visibleForms(forms, "feed", "title")), [
    "Customer feedback",
    "FEEDBACK form",
  ]);
  assert.deepEqual(visibleForms(forms, "nothing here", "title"), []);
});

test("each sort key orders correctly", () => {
  const forms = [
    f("Beta", { created: "2026-01-02", updated: "2026-03-01", responses: 5 }),
    f("Alpha", { created: "2026-01-03", updated: "2026-02-01", responses: 9 }),
    f("Gamma", { created: "2026-01-01", updated: "2026-04-01", responses: 1 }),
  ];
  assert.deepEqual(titles(visibleForms(forms, "", "title")), ["Alpha", "Beta", "Gamma"]);
  assert.deepEqual(titles(visibleForms(forms, "", "created")), ["Alpha", "Beta", "Gamma"]);
  assert.deepEqual(titles(visibleForms(forms, "", "updated")), ["Gamma", "Beta", "Alpha"]);
  assert.deepEqual(titles(visibleForms(forms, "", "responses")), ["Alpha", "Beta", "Gamma"]);
});

test("does not mutate the input array", () => {
  const forms = [f("Zeta"), f("Alpha")];
  const before = titles(forms);
  visibleForms(forms, "", "title");
  assert.deepEqual(titles(forms), before);
});

test("filtering and sorting compose", () => {
  const forms = [
    f("Feedback B", { responses: 2 }),
    f("Survey", { responses: 99 }),
    f("Feedback A", { responses: 7 }),
  ];
  assert.deepEqual(titles(visibleForms(forms, "feedback", "responses")), [
    "Feedback A",
    "Feedback B",
  ]);
});
