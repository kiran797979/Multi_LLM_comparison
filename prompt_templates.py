"""
prompt_templates.py  –  Dynamic Prompt Builder (Task 2.1 & 2.2)

Builds structured prompts from user-selected parameters:
  content_type, tone, audience, length, keywords, topic
"""

# ──────────────────────────────────────────────────────────────────
# Option lists used by the Streamlit UI and CLI
# ──────────────────────────────────────────────────────────────────

CONTENT_TYPES = [
    "LinkedIn Post",
    "Professional Email",
    "Advertisement Copy",
]

TONES = [
    "Professional",
    "Casual",
    "Persuasive",
    "Friendly",
]

# Content-length options  →  (label shown in UI, line-count instruction)
LENGTHS = [
    ("Short",  "3-4 lines"),
    ("Medium", "6-8 lines"),
    ("Long",   "10-12 lines"),
]


# ──────────────────────────────────────────────────────────────────
# build_prompt  –  core dynamic-prompt engine
# ──────────────────────────────────────────────────────────────────

def build_prompt(
    content_type: str,
    tone: str,
    audience: str,
    length: str,
    keywords: str,
    topic: str,
) -> str:
    """
    Construct a detailed prompt tailored to the chosen content type.

    Parameters
    ----------
    content_type : str   – "LinkedIn Post", "Professional Email", or "Advertisement Copy"
    tone         : str   – desired voice (Professional, Casual, Persuasive, Friendly)
    audience     : str   – free-text target audience
    length       : str   – "Short", "Medium", or "Long"
    keywords     : str   – comma-separated keywords (may be empty)
    topic        : str   – the main idea / subject to write about

    Returns
    -------
    str – the fully-assembled prompt ready for the model
    """

    # Resolve line-count instruction from the length label
    length_instruction = length  # fallback
    for label, lines in LENGTHS:
        if label == length:
            length_instruction = lines
            break

    # ── Base context shared by every content type ────────────────
    base = (
        f"You are an expert content writer.\n"
        f"Topic: {topic}\n"
        f"Tone: {tone}\n"
        f"Target Audience: {audience}\n"
        f"Content Length: {length_instruction}\n"
    )

    # ── Content-type-specific rules ─────────────────────────────
    if content_type == "LinkedIn Post":
        type_rules = (
            "Write a LinkedIn post.\n"
            "Rules:\n"
            "- Use a professional tone throughout.\n"
            "- Add 3-5 relevant hashtags at the end.\n"
            "- Write in a social-media style with short paragraphs.\n"
            "- Use line breaks between paragraphs for readability.\n"
            "- Open with an attention-grabbing hook.\n"
        )

    elif content_type == "Professional Email":
        type_rules = (
            "Write a professional email.\n"
            "Rules:\n"
            "- Start with a line that says 'Subject: <subject line>'.\n"
            "- Follow formal email structure: Greeting, Body, Closing.\n"
            "- Do NOT use emojis.\n"
            "- Keep paragraphs concise and well-structured.\n"
        )

    elif content_type == "Advertisement Copy":
        type_rules = (
            "Write an advertisement copy.\n"
            "Rules:\n"
            "- Use a persuasive, marketing-oriented tone.\n"
            "- Include a clear Call-To-Action (CTA) such as "
            "'Download Now', 'Try Free', 'Get Started', 'Sign Up', or 'Buy Now'.\n"
            "- Keep the language punchy and benefit-focused.\n"
            "- End with the CTA on its own line.\n"
        )
    else:
        # Fallback for any unexpected value
        type_rules = f"Write a {content_type}.\n"

    # ── Keywords rule ───────────────────────────────────────────
    if keywords and keywords.strip():
        keyword_rule = (
            f"Keywords to naturally include: {keywords.strip()}\n"
            "Make sure the keywords fit organically — do not force them.\n"
        )
    else:
        keyword_rule = ""

    # ── Assemble the final prompt ───────────────────────────────
    prompt = base + "\n" + type_rules + "\n" + keyword_rule
    return prompt.strip()


# ──────────────────────────────────────────────────────────────────
# Post-processing / formatting helpers
# ──────────────────────────────────────────────────────────────────

def format_output(content_type: str, raw_text: str) -> str:
    """
    Apply light post-processing to the raw model output based on
    the content type.  Returns the cleaned-up text.
    """
    text = raw_text.strip()

    if content_type == "LinkedIn Post":
        # Ensure blank lines between paragraphs for readability
        text = text.replace("\n\n", "\n\n")  # already fine; keep idempotent

    elif content_type == "Professional Email":
        # Make the Subject line stand out
        if text.lower().startswith("subject:"):
            first_nl = text.find("\n")
            if first_nl != -1:
                subject_line = text[:first_nl].strip()
                rest = text[first_nl:].strip()
                text = f"**{subject_line}**\n\n{rest}"

    elif content_type == "Advertisement Copy":
        # Bold the last line if it looks like a CTA
        lines = text.split("\n")
        if lines:
            last = lines[-1].strip()
            cta_words = ["download", "try", "get started", "sign up",
                         "buy now", "start", "join", "shop", "order",
                         "subscribe", "learn more", "click"]
            if any(w in last.lower() for w in cta_words):
                lines[-1] = f"**{last}**"
                text = "\n".join(lines)

    return text


# ──────────────────────────────────────────────────────────────────
# Validation helpers
# ──────────────────────────────────────────────────────────────────

def validate_output(content_type: str, text: str) -> list:
    """
    Check that the generated text meets minimum requirements.

    Returns a list of warning strings.  Empty list = all good.
    """
    warnings = []
    lower = text.lower()

    if content_type == "Professional Email":
        if "subject:" not in lower:
            warnings.append("⚠️ Email is missing a 'Subject:' line.")

    elif content_type == "LinkedIn Post":
        if "#" not in text:
            warnings.append("⚠️ LinkedIn post is missing hashtags.")

    elif content_type == "Advertisement Copy":
        cta_words = ["download", "try", "get started", "sign up",
                     "buy now", "start free", "join", "shop now",
                     "order now", "subscribe", "learn more", "click"]
        if not any(w in lower for w in cta_words):
            warnings.append("⚠️ Advertisement is missing a Call-To-Action (CTA).")

    return warnings
