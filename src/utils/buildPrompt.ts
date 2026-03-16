import type { FormData } from "../types/form";

const lengthGuide: Record<string, string> = {
  short: "Keep it concise — around 50–100 words.",
  medium: "Aim for a moderate length — around 150–250 words.",
  long: "Write a detailed, in-depth piece — 400+ words.",
};

const contentTypeLabel: Record<string, string> = {
  linkedin: "LinkedIn post",
  email: "email",
  "social-media": "social media post",
  "product-description": "product description",
  "ad-copy": "advertisement copy",
  "press-release": "press release",
  newsletter: "newsletter",
  "tweet-thread": "tweet thread",
  "youtube-description": "YouTube description",
  "sales-pitch": "sales pitch",
  blog: "blog article",
  "landing-page": "landing page copy",
};

export function buildPrompt(form: FormData): string {
  const type = contentTypeLabel[form.contentType] ?? form.contentType;
  const length = lengthGuide[form.length] ?? lengthGuide.medium;

  const keywordLine =
    form.keywords.trim()
      ? `Incorporate these keywords naturally: ${form.keywords.trim()}.`
      : "";

  const audienceLine =
    form.targetAudience.trim()
      ? `The target audience is: ${form.targetAudience.trim()}.`
      : "";

  const parts = [
    `Write a ${type} about the following topic:`,
    `"${form.topic.trim()}"`,
    "",
    `Tone: ${form.tone}.`,
    audienceLine,
    keywordLine,
    length,
    "",
    "Return only the final content — no meta-commentary, labels, or explanations.",
  ].filter(Boolean);

  return parts.join("\n");
}
