/* ─────────────────────────────────────────────────────
   Form types, options, defaults & validation
   ───────────────────────────────────────────────────── */

// ── Option arrays (single source of truth) ──────────

export const contentTypeOptions = [
  { value: "linkedin", label: "LinkedIn Post" },
  { value: "email", label: "Email" },
  { value: "blog", label: "Blog Article" },
  { value: "social-media", label: "Social Media" },
  { value: "product-description", label: "Product Description" },
  { value: "ad-copy", label: "Ad Copy" },
  { value: "press-release", label: "Press Release" },
  { value: "newsletter", label: "Newsletter" },
  { value: "tweet-thread", label: "Tweet Thread" },
  { value: "youtube-description", label: "YouTube Description" },
  { value: "sales-pitch", label: "Sales Pitch" },
  { value: "landing-page", label: "Landing Page" },
] as const;

export const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
  { value: "persuasive", label: "Persuasive" },
  { value: "informative", label: "Informative" },
] as const;

export const lengthOptions = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
] as const;

export const modelOptions = [
  { value: "deepseek/deepseek-r1", label: "DeepSeek R1", dot: "bg-emerald-400" },
  { value: "mistralai/mistral-7b", label: "Mistral 7B", dot: "bg-orange-400" },
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini", dot: "bg-emerald-400" },
  { value: "meta-llama/llama-3.2-90b", label: "LLaMA 3.2 90B", dot: "bg-violet-400" },
  { value: "google/gemini-2.5-flash", label: "Gemini Flash", dot: "bg-cyan-400" },
  { value: "qwen/qwen-2.5-72b", label: "Qwen 2.5 72B", dot: "bg-rose-400" },
] as const;

// ── Union types derived from option arrays ──────────

export type ContentType = (typeof contentTypeOptions)[number]["value"];
export type Tone = (typeof toneOptions)[number]["value"];
export type Length = (typeof lengthOptions)[number]["value"];
export type Model = (typeof modelOptions)[number]["value"];

// ── Form data ───────────────────────────────────────

export type FormData = {
  topic: string;
  contentType: ContentType;
  tone: Tone;
  length: Length;
  targetAudience: string;
  keywords: string;
  model: Model;
};

export const initialFormData: FormData = {
  topic: "",
  contentType: "linkedin",
  tone: "professional",
  length: "medium",
  targetAudience: "",
  keywords: "",
  model: "google/gemini-2.5-flash",
};

// ── Validation ──────────────────────────────────────

export type ValidationErrors = Partial<Record<keyof FormData, string>>;

export const validationRules: Record<
  string,
  (value: string) => string | null
> = {
  topic: (v) =>
    v.trim().length < 3 ? "Topic must be at least 3 characters" : null,
  targetAudience: (v) =>
    v.trim().length > 0 && v.trim().length < 2
      ? "Audience must be at least 2 characters"
      : null,
  keywords: (v) =>
    v.trim().length > 0 && v.trim().length < 2
      ? "Keywords must be at least 2 characters"
      : null,
};