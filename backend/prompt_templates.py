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
    "Blog Post",
    "Social Media Caption",
    "Product Description",
    "Press Release",
    "Newsletter Content",
    "Tweet Thread",
    "YouTube Description",
    "Sales Pitch",
    "Landing Page Copy",
]

TONES = [
    "Professional",
    "Casual",
    "Persuasive",
    "Friendly",
    "Authoritative",
    "Inspirational",
    "Humorous",
    "Urgent",
    "Educational",
    "Conversational",
    "Formal",
    "Enthusiastic",
]

# Content-length options  →  (label shown in UI, line-count instruction)
LENGTHS = [
    ("Very Short", "2-3 sentences"),
    ("Short", "3-4 lines"),
    ("Medium", "6-8 lines"),
    ("Long", "10-12 lines"),
    ("Very Long", "15-20 lines"),
    ("Extended", "20+ lines with multiple paragraphs"),
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

    elif content_type == "Blog Post":
        type_rules = (
            "Write a blog post.\n"
            "Rules:\n"
            "- Start with an engaging headline.\n"
            "- Use subheadings to structure the content.\n"
            "- Write in an informative yet engaging style.\n"
            "- Include actionable insights or takeaways.\n"
            "- End with a conclusion that summarizes key points.\n"
        )

    elif content_type == "Social Media Caption":
        type_rules = (
            "Write a social media caption.\n"
            "Rules:\n"
            "- Keep it concise and engaging.\n"
            "- Use emojis to enhance readability.\n"
            "- Include 3-5 relevant hashtags.\n"
            "- Ask a question or include a call-to-action for engagement.\n"
            "- Make it shareable and relatable.\n"
        )

    elif content_type == "Product Description":
        type_rules = (
            "Write a product description.\n"
            "Rules:\n"
            "- Focus on benefits, not just features.\n"
            "- Use bullet points for key specifications.\n"
            "- Include emotional appeal and practical value.\n"
            "- Address potential customer concerns.\n"
            "- End with a compelling reason to buy.\n"
        )

    elif content_type == "Press Release":
        type_rules = (
            "Write a press release.\n"
            "Rules:\n"
            "- Start with a compelling headline.\n"
            "- Include location and date in the first paragraph.\n"
            "- Use the inverted pyramid structure (most important info first).\n"
            "- Include quotes from relevant stakeholders.\n"
            "- End with company contact information.\n"
        )

    elif content_type == "Newsletter Content":
        type_rules = (
            "Write newsletter content.\n"
            "Rules:\n"
            "- Start with a personal greeting.\n"
            "- Use a conversational, friendly tone.\n"
            "- Include multiple short sections or updates.\n"
            "- Add value through tips, insights, or news.\n"
            "- End with a clear next step or call-to-action.\n"
        )

    elif content_type == "Tweet Thread":
        type_rules = (
            "Write a Twitter thread (multiple connected tweets).\n"
            "Rules:\n"
            "- Start with a hook tweet that promises value.\n"
            "- Number each tweet (1/n, 2/n, etc.).\n"
            "- Keep each tweet under 280 characters.\n"
            "- Use thread connectors like 'Here's why:' or 'The problem:'\n"
            "- End with a summary or call-to-action tweet.\n"
        )

    elif content_type == "YouTube Description":
        type_rules = (
            "Write a YouTube video description.\n"
            "Rules:\n"
            "- Start with a compelling summary of the video content.\n"
            "- Include timestamps for important sections.\n"
            "- Add relevant links and resources mentioned in the video.\n"
            "- Include social media links and subscribe call-to-action.\n"
            "- Use relevant tags and keywords for discoverability.\n"
        )

    elif content_type == "Sales Pitch":
        type_rules = (
            "Write a sales pitch.\n"
            "Rules:\n"
            "- Start by identifying the problem or pain point.\n"
            "- Present your solution clearly and compellingly.\n"
            "- Include social proof or testimonials if relevant.\n"
            "- Address common objections.\n"
            "- End with a strong, specific call-to-action.\n"
        )

    elif content_type == "Landing Page Copy":
        type_rules = (
            "Write landing page copy.\n"
            "Rules:\n"
            "- Start with a powerful headline that captures attention.\n"
            "- Use bullet points to highlight key benefits.\n"
            "- Include social proof elements.\n"
            "- Create urgency or scarcity if appropriate.\n"
            "- Have a clear, prominent call-to-action button text.\n"
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
        text = text.replace("\n\n", "\n\n")

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
            cta_words = [
                "download",
                "try",
                "get started",
                "sign up",
                "buy now",
                "start",
                "join",
                "shop",
                "order",
                "subscribe",
                "learn more",
                "click",
            ]
            if any(w in last.lower() for w in cta_words):
                lines[-1] = f"**{last}**"
                text = "\n".join(lines)

    elif content_type == "Blog Post":
        # Format headings in markdown style
        lines = text.split("\n")
        formatted_lines = []
        for line in lines:
            stripped = line.strip()
            if stripped and not line.startswith(" ") and len(stripped.split()) <= 8:
                # Likely a heading
                if not stripped.startswith("#"):
                    formatted_lines.append(f"## {stripped}")
                else:
                    formatted_lines.append(line)
            else:
                formatted_lines.append(line)
        text = "\n".join(formatted_lines)

    elif content_type == "Tweet Thread":
        # Format tweets with proper numbering and threading
        if not text.startswith("1/"):
            lines = [item_line for item_line in text.split("\n") if item_line.strip()]
            tweet_count = len(lines)
            formatted_lines = []
            for i, line in enumerate(lines, 1):
                formatted_lines.append(f"{i}/{tweet_count}: {line}")
            text = "\n\n".join(formatted_lines)

    elif content_type == "Press Release":
        # Ensure proper press release formatting
        if not text.upper().startswith("FOR IMMEDIATE RELEASE"):
            text = "FOR IMMEDIATE RELEASE\n\n" + text

    elif content_type in ["Landing Page Copy", "Sales Pitch"]:
        # Bold key CTAs and benefits
        text = _enhance_sales_copy(text)

    return text


def _enhance_sales_copy(text: str) -> str:
    """Helper to enhance sales-oriented content."""
    lines = text.split("\n")
    enhanced_lines = []

    for line in lines:
        stripped = line.strip().lower()
        # Bold lines that look like benefits or CTAs
        if any(
            word in stripped
            for word in ["save", "get", "free", "guarantee", "proven", "results"]
        ):
            enhanced_lines.append(
                f"**{line.strip()}**" if not line.strip().startswith("**") else line
            )
        else:
            enhanced_lines.append(line)

    return "\n".join(enhanced_lines)


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
    word_count = len(text.split())

    if content_type == "Professional Email":
        if "subject:" not in lower:
            warnings.append("⚠️ Email is missing a 'Subject:' line.")
        if word_count < 10:
            warnings.append(
                "⚠️ Email content seems too short for a professional message."
            )

    elif content_type == "LinkedIn Post":
        if "#" not in text:
            warnings.append("⚠️ LinkedIn post is missing hashtags.")
        if word_count > 300:
            warnings.append("⚠️ LinkedIn post may be too long for optimal engagement.")

    elif content_type == "Advertisement Copy":
        cta_words = [
            "download",
            "try",
            "get started",
            "sign up",
            "buy now",
            "start free",
            "join",
            "shop now",
            "order now",
            "subscribe",
            "learn more",
            "click",
        ]
        if not any(w in lower for w in cta_words):
            warnings.append("⚠️ Advertisement is missing a Call-To-Action (CTA).")

    elif content_type == "Blog Post":
        if word_count < 50:
            warnings.append("⚠️ Blog post seems too short for meaningful content.")
        if "#" not in text:
            warnings.append(
                "⚠️ Blog post could benefit from subheadings for better structure."
            )

    elif content_type == "Social Media Caption":
        if "#" not in text:
            warnings.append("⚠️ Social media caption is missing hashtags.")
        if not any(
            emoji in text for emoji in ["😀", "🎉", "✨", "🔥", "💯", "❤️", "👍", "🌟"]
        ):
            warnings.append(
                "⚠️ Social media caption could be more engaging with emojis."
            )

    elif content_type == "Product Description":
        benefit_words = [
            "benefit",
            "advantage",
            "solution",
            "improve",
            "enhance",
            "save",
            "increase",
        ]
        if not any(word in lower for word in benefit_words):
            warnings.append(
                "⚠️ Product description should emphasize benefits, not just features."
            )

    elif content_type == "Press Release":
        if "for immediate release" not in lower:
            warnings.append(
                "⚠️ Press release should start with 'FOR IMMEDIATE RELEASE'."
            )
        if '"' not in text:
            warnings.append("⚠️ Press release could benefit from stakeholder quotes.")

    elif content_type == "Newsletter Content":
        if word_count < 30:
            warnings.append("⚠️ Newsletter content seems too short to provide value.")

    elif content_type == "Tweet Thread":
        if "/" not in text:
            warnings.append(
                "⚠️ Tweet thread should have numbered tweets (e.g., 1/5, 2/5)."
            )
        tweets = [line for line in text.split("\n") if line.strip()]
        if len(tweets) < 3:
            warnings.append(
                "⚠️ Tweet thread should have at least 3 tweets for effectiveness."
            )

    elif content_type == "YouTube Description":
        if ":" not in text:
            warnings.append("⚠️ YouTube description could benefit from timestamps.")

    elif content_type in ["Sales Pitch", "Landing Page Copy"]:
        cta_words = [
            "download",
            "try",
            "get started",
            "sign up",
            "buy now",
            "contact",
            "schedule",
            "book",
        ]
        if not any(w in lower for w in cta_words):
            warnings.append("⚠️ Sales content should have a clear call-to-action.")
        if "benefit" not in lower and "solution" not in lower:
            warnings.append(
                "⚠️ Sales content should clearly communicate benefits or solutions."
            )

    return warnings
