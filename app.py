import os
import random
import streamlit as st
from dotenv import load_dotenv
from openai import OpenAI
from prompt_templates import (
    CONTENT_TYPES, TONES, LENGTHS,
    build_prompt, format_output, validate_output,
)

# ── Load environment & create OpenRouter client ─────────────────
load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
)

# ── Available models ────────────────────────────────────────────
AVAILABLE_MODELS = [
    "deepseek/deepseek-chat",
    "mistralai/mistral-7b-instruct",
    "openai/gpt-oss-120b:free",
]

# ── Prompt suggestions: label → auto-fill text ──────────────────
PROMPT_SUGGESTIONS = {
    "— None —": "",
    "Instagram Ad": "Create an engaging Instagram ad for a new fitness tracking app that gamifies workouts",
    "Product Launch": "Announce the launch of a smart home device that uses AI to optimize energy usage",
    "Job Announcement": "We are hiring a Senior Machine Learning Engineer to join our growing AI team",
    "Event Promotion": "Promote a free virtual workshop on personal branding for tech professionals",
    "Study Tips": "Share effective study techniques using spaced repetition and active recall",
    "Startup Pitch": "Pitch a fintech startup that helps freelancers automate invoicing and tax filing",
    "Email Outreach": "Reach out to potential B2B clients about our new cloud-based analytics platform",
    "LinkedIn Thought Leadership": "Share insights on how AI is transforming the recruitment industry in 2026",
}

# ── Random topic ideas for the 'Generate Random Idea' button ────
RANDOM_IDEAS = [
    "AI-powered study planner app for college students",
    "Sustainable fashion marketplace connecting eco-friendly brands",
    "Remote team productivity tool with async video messaging",
    "Mental health chatbot for workplace stress management",
    "Personalized nutrition app using DNA-based meal plans",
    "Blockchain-based credential verification for job seekers",
    "Virtual reality language learning platform",
    "Smart budgeting app that rounds up purchases into investments",
    "Pet health monitoring wearable with vet telemedicine",
    "AI resume builder that tailors CVs to specific job postings",
    "Community-driven local event discovery platform",
    "Automated social media scheduler with AI caption writing",
    "Online tutoring marketplace connecting students with experts",
    "Carbon footprint tracker integrated with daily spending",
    "Subscription box service for DIY electronics hobby kits",
    "Voice-first recipe assistant for hands-free cooking",
    "Freelancer invoicing tool with built-in tax estimation",
    "Gamified fitness app with real-world rewards",
    "AI-driven customer support chatbot for e-commerce stores",
    "Digital business card app with NFC tap-to-share",
]

# ── Page config ─────────────────────────────────────────────────
st.set_page_config(page_title="AI Content Generator", page_icon="✍️")
st.title("✍️ AI Content Generator")
st.write("Generate tailored content using dynamic prompts and multiple AI models.")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 1 — Configure Your Content
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

st.subheader("1️⃣  Configure Your Content")

# ── Model selection & multi-model toggle ────────────────────────
compare_mode = st.checkbox(
    "Compare Across Multiple Models",
    help="Enable to generate content from several models side-by-side.",
)

if compare_mode:
    selected_models = st.multiselect(
        "Select Models to Compare",
        AVAILABLE_MODELS,
        default=AVAILABLE_MODELS,
        help="Pick two or more models for a side-by-side comparison.",
    )
else:
    model_choice = st.selectbox(
        "AI Model",
        AVAILABLE_MODELS,
        help="Choose which AI model generates the content.",
    )
    selected_models = [model_choice]

st.divider()

# ── Two-column layout for the main dropdowns ────────────────────
col1, col2 = st.columns(2)

with col1:
    content_type = st.selectbox(
        "Content Type",
        CONTENT_TYPES,
        help="LinkedIn Post, Professional Email, or Advertisement Copy.",
    )

    tone = st.selectbox(
        "Tone",
        TONES,
        help="Sets the voice of the generated content.",
    )

with col2:
    length_label = st.selectbox(
        "Content Length",
        [l[0] for l in LENGTHS],
        help="Short ≈ 3-4 lines · Medium ≈ 6-8 lines · Long ≈ 10-12 lines.",
    )

    keywords = st.text_input(
        "Keywords (optional)",
        placeholder="e.g. AI, productivity, students",
        help="Comma-separated keywords to weave into the content.",
    )

# Target Audience (full width)
audience = st.text_input(
    "Target Audience",
    placeholder="e.g. college students, startup founders",
    help="Describe who will read or see this content.",
)

st.divider()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FEATURE 3 — Prompt Suggestions & Random Idea
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

suggestion_col, random_col = st.columns([3, 1])

with suggestion_col:
    suggestion = st.selectbox(
        "Prompt Suggestion",
        list(PROMPT_SUGGESTIONS.keys()),
        help="Pick a preset idea to auto-fill the Topic field.",
    )

with random_col:
    st.write("")  # vertical spacer to align with dropdown
    st.write("")
    random_clicked = st.button("🎲 Random Idea")

# Determine auto-fill value
# Priority: random button > suggestion dropdown > empty
if random_clicked:
    auto_fill = random.choice(RANDOM_IDEAS)
elif suggestion != "— None —":
    auto_fill = PROMPT_SUGGESTIONS[suggestion]
else:
    auto_fill = ""

# Topic / Idea text area (use auto-fill as default when provided)
topic = st.text_area(
    "Topic / Idea",
    value=auto_fill,
    placeholder="e.g. AI-powered study planner app that helps students manage deadlines",
    help="The main subject or idea you want the content to be about.",
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FEATURE 2 — Live Prompt Preview
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Build the prompt from selected parameters (updates live)
prompt = build_prompt(
    content_type=content_type,
    tone=tone,
    audience=audience or "general audience",
    length=length_label,
    keywords=keywords,
    topic=topic or "an innovative new product",
)

st.divider()
st.subheader("🔍 Generated Prompt Preview")
st.code(prompt, language="text")

# ── Temperature slider ──────────────────────────────────────────
temperature = st.slider(
    "Temperature (creativity)",
    min_value=0.0, max_value=1.5, value=0.7, step=0.05,
    help="Higher values → more creative; lower → more focused.",
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Helper — call one model and return (formatted_text, warnings)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def generate_for_model(model_name, prompt_text, temp):
    """Call a single model via OpenRouter and return formatted output + warnings."""
    response = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user", "content": prompt_text}],
        temperature=temp,
    )
    raw = response.choices[0].message.content
    formatted = format_output(content_type, raw)
    warnings = validate_output(content_type, raw)
    return formatted, warnings

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Generate & Display
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

st.divider()
st.subheader("2️⃣  Generate")

if st.button("🚀 Generate Content"):
    # ── Input validation ────────────────────────────────────────
    if not topic.strip():
        st.warning("Please enter a Topic / Idea before generating.")
    elif not audience.strip():
        st.warning("Please enter a Target Audience.")
    elif compare_mode and len(selected_models) == 0:
        st.warning("Please select at least one model.")
    else:
        # ── Collect results from each selected model ────────────
        results = {}  # model_name → (formatted, warnings) or error str

        with st.spinner("Generating…"):
            for model_name in selected_models:
                try:
                    formatted, warnings = generate_for_model(
                        model_name, prompt, temperature,
                    )
                    results[model_name] = (formatted, warnings)
                except Exception as e:
                    results[model_name] = str(e)

        # ── Display results ─────────────────────────────────────
        st.subheader("3️⃣  Output")

        if compare_mode and len(selected_models) > 1:
            # Show each model in its own tab
            tabs = st.tabs([m.split("/")[-1] for m in selected_models])
            for tab, model_name in zip(tabs, selected_models):
                with tab:
                    st.caption(f"**Model:** `{model_name}`")
                    result = results.get(model_name)
                    if isinstance(result, str):
                        # Error string
                        st.error(f"Error: {result}")
                    else:
                        formatted, warnings = result
                        for w in warnings:
                            st.warning(w)
                        if not warnings:
                            st.success("✅ Validation passed")
                        st.markdown(formatted)
        else:
            # Single-model output (no tabs needed)
            model_name = selected_models[0]
            result = results.get(model_name)
            if isinstance(result, str):
                st.error(f"Error: {result}")
            else:
                formatted, warnings = result
                for w in warnings:
                    st.warning(w)
                if not warnings:
                    st.success("✅ Validation passed")
                st.markdown(formatted)

        # ── Selected parameters summary ─────────────────────────
        with st.expander("📋 Selected Parameters"):
            models_str = ", ".join(selected_models)
            st.markdown(
                f"- **Model(s):** {models_str}\n"
                f"- **Content Type:** {content_type}\n"
                f"- **Tone:** {tone}\n"
                f"- **Audience:** {audience}\n"
                f"- **Length:** {length_label}\n"
                f"- **Keywords:** {keywords if keywords else '—'}\n"
                f"- **Temperature:** {temperature}"
            )
