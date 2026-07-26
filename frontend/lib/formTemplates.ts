// Starter forms offered as suggestion cards on the dashboard. Question-type
// defaults (placeholders, rating scale) come from QUESTION_META at creation
// time — only the parts that differ per template live here.
import type { QuestionType } from "./types";

export interface TemplateQuestion {
  type: QuestionType;
  title: string;
  required?: boolean;
  options?: string[];
}

export interface FormTemplate {
  id: string;
  /** Card copy, phrased as the suggestion. */
  prompt: string;
  title: string;
  description: string;
  questions: TemplateQuestion[];
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "request-intake",
    prompt: "Collect and prioritize incoming requests efficiently for better workflow management.",
    title: "Request intake",
    description: "Tell us what you need and how urgent it is.",
    questions: [
      { type: "short_text", title: "Who's making this request?", required: true },
      {
        type: "multiple_choice",
        title: "What kind of request is this?",
        required: true,
        options: ["Bug", "Feature", "Question", "Access"],
      },
      {
        type: "dropdown",
        title: "How urgent is it?",
        required: true,
        options: ["Low", "Medium", "High", "Blocking"],
      },
      { type: "long_text", title: "Describe the request in detail" },
      { type: "short_text", title: "When do you need this by?" },
    ],
  },
  {
    id: "project-milestones",
    prompt: "Monitor project milestones and team updates to ensure timely completion.",
    title: "Project milestone check-in",
    description: "A quick status update on your workstream.",
    questions: [
      { type: "short_text", title: "Which project are you updating?", required: true },
      {
        type: "multiple_choice",
        title: "What's the milestone status?",
        required: true,
        options: ["On track", "At risk", "Blocked", "Shipped"],
      },
      { type: "number", title: "How complete is it, as a percentage?" },
      { type: "long_text", title: "What's blocking you, if anything?" },
      { type: "rating", title: "How confident are you in the timeline?" },
    ],
  },
];
