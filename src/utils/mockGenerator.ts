import type { FormData } from "../types/form";

const toneStyles: Record<string, { opener: string; voice: string; closer: string }> = {
  professional: {
    opener: "I want to share an important insight",
    voice: "In today's rapidly evolving landscape, staying ahead requires strategic thinking and deliberate action.",
    closer: "I'd welcome your thoughts on this.",
  },
  friendly: {
    opener: "Hey everyone! I've got something fun to share",
    voice: "I love exploring new ideas, and this one really stood out to me.",
    closer: "Would love to hear your experiences too!",
  },
  persuasive: {
    opener: "Here's something you can't afford to ignore",
    voice: "The data is clear, and the opportunity is massive for those who act now.",
    closer: "Don't wait — the time to act is now.",
  },
  informative: {
    opener: "Here's a breakdown you'll find useful",
    voice: "The research points to several key factors that are worth understanding in depth.",
    closer: "Hopefully this gives you a clearer picture.",
  },
  witty: {
    opener: "Plot twist — this actually matters",
    voice: "Turns out the boring stuff is where the magic happens. Who knew?",
    closer: "You're welcome. Now go impress someone with this.",
  },
};

function getStyle(tone: string) {
  return toneStyles[tone] ?? toneStyles.professional;
}

function buildKeywordString(keywords: string): string {
  const tags = keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  if (tags.length === 0) return "";
  return tags.join(", ");
}

function buildHashtags(keywords: string): string {
  const tags = keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .map((k) => `#${k.replace(/\s+/g, "")}`);
  return tags.length > 0 ? tags.join(" ") : "#Growth #Innovation #Strategy";
}

function pad(text: string, target: "short" | "medium" | "long"): string {
  const fillers: Record<string, string[]> = {
    short: [],
    medium: [
      "This is becoming increasingly relevant across industries. Organizations that adapt early are already seeing measurable results.",
      "The key is to start small, test often, and iterate based on real feedback from your audience.",
      "When we look at the broader trends, the direction is unmistakable — and the early movers will have a significant advantage.",
    ],
    long: [
      "This is becoming increasingly relevant across industries. Organizations that adapt early are already seeing measurable results.",
      "The key is to start small, test often, and iterate based on real feedback from your audience.",
      "When we look at the broader trends, the direction is unmistakable — and the early movers will have a significant advantage.",
      "Consider how this applies to your own workflow. Even incremental changes can compound into transformative outcomes over time.",
      "I've seen teams completely reinvent their approach by embracing these principles. The results speak for themselves.",
      "What separates good from great here is consistency. It's not about one big move — it's about showing up with intention every single day.",
      "The most successful professionals I know treat this as a core competency, not an afterthought. That mindset shift alone can be a game-changer.",
    ],
  };
  const extra = fillers[target] ?? fillers.medium;
  return extra.length > 0 ? text + "\n\n" + extra.join(" ") : text;
}

function generateLinkedIn(form: FormData): string {
  const style = getStyle(form.tone);
  const hashtags = buildHashtags(form.keywords);
  const length = form.length as "short" | "medium" | "long";

  const core = `${style.opener} about ${form.topic}.

${style.voice}

For ${form.targetAudience}, this matters because the landscape is shifting fast. Those who lean in now will be the ones setting the pace tomorrow.

${style.closer}`;

  return `${pad(core, length)}

${hashtags}`;
}

function generateEmail(form: FormData): string {
  const style = getStyle(form.tone);
  const kw = buildKeywordString(form.keywords);
  const length = form.length as "short" | "medium" | "long";

  const greeting =
    form.tone === "friendly" || form.tone === "casual" ? "Hey there," : "Dear valued reader,";
  const signOff =
    form.tone === "friendly" || form.tone === "casual" ? "Cheers," : "Best regards,";

  const core = `Subject: ${form.topic} — What ${form.targetAudience} Need to Know

${greeting}

${style.opener} about ${form.topic}. ${style.voice}

${kw ? `Key areas to focus on: ${kw}.` : ""}

As someone in the ${form.targetAudience} space, you're uniquely positioned to take advantage of what's ahead. We've put together actionable insights to help you move forward with confidence.

${style.closer}

${signOff}
AI Content Studio`;

  return pad(core, length);
}

function generateAdCopy(form: FormData): string {
  const style = getStyle(form.tone);
  const kw = buildKeywordString(form.keywords);
  const length = form.length as "short" | "medium" | "long";

  const headlines: Record<string, string> = {
    professional: `Transform Your Approach to ${form.topic}`,
    friendly: `Ready to Explore ${form.topic}? Let's Go!`,
    persuasive: `Stop Falling Behind on ${form.topic}`,
    informative: `Everything You Need to Know About ${form.topic}`,
    witty: `${form.topic}? Yeah, We've Got You Covered`,
  };

  const headline = headlines[form.tone] ?? headlines.professional;

  const core = `${headline}

${style.voice}

Built for ${form.targetAudience} who demand results.${kw ? ` Covering ${kw} and more.` : ""}

${form.tone === "persuasive" ? "Act now — limited availability." : "Get started today and see the difference."}

[Learn More]  |  [Get Started]  |  [Book a Demo]`;

  return pad(core, length);
}

function buildContent(formData: FormData): string {
  switch (formData.contentType) {
    case "linkedin":
      return generateLinkedIn(formData);
    case "email":
      return generateEmail(formData);
    case "ad-copy":
      return generateAdCopy(formData);
    default:
      return generateLinkedIn(formData);
  }
}

export async function generateMockContent(formData: FormData, signal?: AbortSignal): Promise<string> {
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 1500);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    }, { once: true });
  });
  return buildContent(formData);
}
