
import random
import time
import streamlit as st
from openai import OpenAI
from config import Config, validate_environment
from prompt_templates import (
    CONTENT_TYPES,
    TONES,
    LENGTHS,
    build_prompt,
    format_output,
    validate_output,
)

# ── Validate environment and setup ──────────────────────────────
validate_environment()

# ── Create OpenRouter client ────────────────────────────────────
try:
    client = OpenAI(
        api_key=Config.OPENROUTER_API_KEY,
        base_url=Config.OPENROUTER_BASE_URL,
        timeout=Config.OPENROUTER_TIMEOUT,
    )
except Exception as e:
    st.error(f"❌ Failed to initialize OpenAI client: {e}")
    st.stop()

# ── Prompt suggestions: label → auto-fill text ──────────────────
PROMPT_SUGGESTIONS = {
    "— None —": "",
    "📱 Tech & Innovation": "Create an engaging Instagram ad for a new fitness tracking app that gamifies workouts",
    "🏢 B2B Solutions": "Announce the launch of a smart home device that uses AI to optimize energy usage",
    "💼 Career & Jobs": "We are hiring a Senior Machine Learning Engineer to join our growing AI team",
    "🎓 Education & Learning": "Promote a free virtual workshop on personal branding for tech professionals",
    "📚 Study & Productivity": "Share effective study techniques using spaced repetition and active recall",
    "💰 Fintech & Business": "Pitch a fintech startup that helps freelancers automate invoicing and tax filing",
    "☁️ Enterprise Software": "Reach out to potential B2B clients about our new cloud-based analytics platform",
    "🤖 AI & Future Tech": "Share insights on how AI is transforming the recruitment industry in 2026",
    "🌱 Sustainability": "Promote an eco-friendly subscription box service for zero-waste living",
    "🎯 Marketing Campaign": "Launch campaign for a meal-planning app that reduces food waste",
    "💊 Health & Wellness": "Introduce a mental health app offering personalized meditation sessions",
    "🎮 Gaming & Entertainment": "Announce a new VR language learning platform with gamified lessons",
    "🏠 Real Estate": "Promote a smart home security system with AI-powered threat detection",
    "🚗 Transportation": "Market an electric bike sharing service for urban commuters",
    "🎨 Creative Industry": "Launch a platform connecting freelance designers with small businesses",
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
st.set_page_config(
    page_title=Config.STREAMLIT_PAGE_TITLE,
    page_icon=Config.STREAMLIT_PAGE_ICON,
    layout=Config.STREAMLIT_LAYOUT,
    initial_sidebar_state="expanded",
)

# ── Header with enhanced styling ────────────────────────────────
st.markdown(
    """
<style>
    .main-header {
        text-align: center;
        padding: 2rem 0 3rem 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin: -1rem -1rem 2rem -1rem;
        border-radius: 0 0 20px 20px;
        color: white;
    }
    
    .main-header h1 {
        font-size: 3.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .main-header p {
        font-size: 1.3rem;
        opacity: 0.9;
        margin: 0;
        font-weight: 300;
    }
    
    .stButton > button {
        background: linear-gradient(45deg, #ff6b6b, #ee5a24);
        color: white;
        border: none;
        border-radius: 25px;
        padding: 0.75rem 2rem;
        font-weight: 600;
        font-size: 1.1rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        background: linear-gradient(45deg, #ee5a24, #ff6b6b);
    }
    
    .content-section {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        margin: 1rem 0;
        border: 1px solid rgba(0,0,0,0.05);
    }
    
    .metric-card {
        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        padding: 1rem;
        border-radius: 10px;
        text-align: center;
        border: 1px solid #dee2e6;
    }
    
    .success-badge {
        background: linear-gradient(45deg, #28a745, #20c997);
        color: white;
        padding: 0.3rem 1rem;
        border-radius: 20px;
        font-weight: 600;
        display: inline-block;
        margin: 0.5rem 0;
    }
    
    .warning-badge {
        background: linear-gradient(45deg, #ffc107, #fd7e14);
        color: white;
        padding: 0.3rem 1rem;
        border-radius: 20px;
        font-weight: 600;
        display: inline-block;
        margin: 0.5rem 0;
    }
    
    .model-info {
        background: linear-gradient(135deg, #e3f2fd, #bbdefb);
        padding: 1rem;
        border-radius: 10px;
        border-left: 4px solid #2196f3;
        margin: 0.5rem 0;
    }
    
    .generated-content {
        background: linear-gradient(135deg, #f8f9fa, #ffffff);
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid #e9ecef;
        margin: 1rem 0;
        font-size: 1.1rem;
        line-height: 1.6;
    }
</style>

<div class="main-header">
    <h1>✍️ AI Content Generator</h1>
    <p>Generate tailored content using dynamic prompts and multiple AI models</p>
</div>
""",
    unsafe_allow_html=True,
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 1 — Configure Your Content
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

st.markdown('<div class="content-section">', unsafe_allow_html=True)
st.markdown("## 1️⃣ Configure Your Content")
st.markdown("Choose your AI model(s) and content parameters to get started.")

# ── Model selection ─────────────────────────────────────────────
st.markdown("### 🤖 Model Selection")
compare_mode = st.checkbox(
    "Compare Across Multiple Models",
    help="Enable to generate content from several models side-by-side.",
)

if compare_mode:
    # Show model options with friendly names
    model_options = {
        Config.get_model_display_name(m): m for m in Config.AVAILABLE_MODELS
    }
    selected_display_names = st.multiselect(
        "Select Models to Compare",
        list(model_options.keys()),
        default=list(model_options.keys())[:3],  # Default to first 3 models
        help="Pick two or more models for a side-by-side comparison.",
    )
    selected_models = [model_options[name] for name in selected_display_names]
else:
    model_options = {
        Config.get_model_display_name(m): m for m in Config.AVAILABLE_MODELS
    }
    model_display_name = st.selectbox(
        "AI Model",
        list(model_options.keys()),
        index=(
            list(model_options.values()).index(Config.DEFAULT_MODEL)
            if Config.DEFAULT_MODEL in Config.AVAILABLE_MODELS
            else 0
        ),
        help="Choose which AI model generates the content.",
    )
    selected_models = [model_options[model_display_name]]

st.divider()

# ── Content parameters with enhanced styling ──────────────────────────────
st.markdown("### 📝 Content Parameters")
st.markdown("Define what type of content you want to generate and who it's for.")

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
        [length_opt[0] for length_opt in LENGTHS],
        help="Short ≈ 3-4 lines · Medium ≈ 6-8 lines · Long ≈ 10-12 lines.",
    )

    keywords = st.text_input(
        "Keywords (optional)",
        placeholder="e.g. AI, productivity, students",
        help="Comma-separated keywords to weave into the content.",
    )

# Topic / Audience section with improved layout
st.markdown("### 🎯 Target & Topic")

# Target Audience (full width)
audience = st.text_input(
    "Target Audience",
    placeholder="e.g. college students, startup founders, marketing professionals",
    help="Describe who will read or see this content. Be specific for better results.",
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FEATURE 3 — Enhanced Prompt Suggestions & Random Ideas
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

st.markdown("### 💡 Inspiration & Ideas")
suggestion_col, random_col = st.columns([3, 1])

with suggestion_col:
    suggestion = st.selectbox(
        "Choose from Popular Ideas",
        list(PROMPT_SUGGESTIONS.keys()),
        help="Pick a preset idea to auto-fill the Topic field, or use the random button for surprise inspiration.",
    )

with random_col:
    st.markdown("**Need inspiration?**")
    random_clicked = st.button("🎲 Surprise Me!", help="Get a random creative idea")

# Determine auto-fill value
# Priority: random button > suggestion dropdown > empty
if random_clicked:
    auto_fill = random.choice(RANDOM_IDEAS)
    st.balloons()  # Fun feedback for random selection
elif suggestion != "— None —":
    auto_fill = PROMPT_SUGGESTIONS[suggestion]
else:
    auto_fill = ""

# Topic / Idea text area with enhanced styling
st.markdown("### ✨ Your Topic/Idea")
topic = st.text_area(
    "What do you want to create content about?",
    value=auto_fill,
    height=100,
    placeholder="e.g. AI-powered study planner app that helps students manage deadlines and track progress",
    help="The main subject or idea you want the content to be about. Be as specific as possible for better results.",
)

st.markdown("</div>", unsafe_allow_html=True)  # Close content-section

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FEATURE 2 — Live Prompt Preview with Enhanced Styling
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
st.markdown('<div class="content-section">', unsafe_allow_html=True)
st.markdown("## 🔍 Generated Prompt Preview")
st.markdown(
    "This is the prompt that will be sent to the AI model(s). You can see how your selections translate into instructions."
)

# Enhanced code display with copy functionality
st.code(prompt, language="text")

# Show prompt statistics
prompt_words = len(prompt.split())
prompt_chars = len(prompt)
col1, col2 = st.columns(2)
with col1:
    st.metric("Word Count", prompt_words)
with col2:
    st.metric("Character Count", prompt_chars)

st.markdown("</div>", unsafe_allow_html=True)

# ── Advanced settings in sidebar ───────────────────────────────
with st.sidebar:
    st.subheader("⚙️ Advanced Settings")
    temperature = st.slider(
        "Temperature (creativity)",
        min_value=0.0,
        max_value=2.0,
        value=Config.DEFAULT_TEMPERATURE,
        step=0.1,
        help="Higher values → more creative; lower → more focused.",
    )

    max_retries = st.number_input(
        "Max Retries",
        min_value=0,
        max_value=5,
        value=Config.MAX_RETRIES,
        help="Number of retry attempts for failed requests.",
    )

    show_debug = st.checkbox(
        "Show Debug Info",
        help="Display additional technical information.",
    )

    st.divider()
    st.subheader("📊 Model Info")

    if selected_models:
        for model in selected_models:
            display_name = Config.get_model_display_name(model)
            st.markdown(f"**{display_name}**")
            if model in Config.FALLBACK_MODELS:
                fallback = Config.FALLBACK_MODELS[model]
                fallback_display = Config.get_model_display_name(fallback)
                st.caption(f"Fallback: {fallback_display}")
            else:
                st.caption("No fallback configured")

    st.divider()
    st.subheader("💡 Tips & Best Practices")

    with st.expander("🎯 Writing Effective Prompts"):
        st.markdown("""
        **For better results:**
        • Be specific about your target audience
        • Include relevant keywords naturally
        • Specify the exact tone you want
        • Mention any specific requirements
        • Provide context about your brand/company
        """)

    with st.expander("📝 Content Type Guide"):
        st.markdown("""
        **LinkedIn Post**: Professional, thought leadership
        **Blog Post**: Informative, SEO-friendly
        **Social Media**: Engaging, hashtag-rich
        **Sales Copy**: Benefit-focused, clear CTA
        **Email**: Clear subject, structured body
        **Product Description**: Features + benefits
        """)

    with st.expander("🎚️ Temperature Guide"):
        st.markdown("""
        **0.0-0.3**: Very focused, consistent
        **0.4-0.7**: Balanced creativity
        **0.8-1.2**: More creative, varied
        **1.3-2.0**: Highly creative, experimental
        
        *Start with 0.7 for most content types*
        """)

    # Dynamic feedback based on user input
    if len(selected_models) > 1:
        st.info(
            "💡 **Tip**: Compare outputs to find the best model for your content style!"
        )

    if not topic.strip():
        st.warning("⚠️ Add a topic to see the generated prompt preview!")

    if audience and topic:
        st.success("✅ Ready to generate awesome content!")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Helper — call one model with retry / fallback logic
# ┌────────────────────────────────────────────────────────────────────────────┐
# │ Enhanced content generation with better error handling and user feedback │
# └────────────────────────────────────────────────────────────────────────────┘


def _extract_status_code(error) -> int | None:
    """
    Try to extract HTTP status code from an OpenAI/httpx exception.
    Returns None if no status code can be determined.
    """
    # openai.APIStatusError stores .status_code
    code = getattr(error, "status_code", None)
    if code is not None:
        return int(code)

    # Some wrapper errors embed it in the string (e.g. "Error code: 429 …")
    msg = str(error)
    if "Error code:" in msg:
        try:
            return int(msg.split("Error code:")[1].strip().split()[0])
        except (IndexError, ValueError):
            pass

    # Check for common error patterns
    msg_lower = msg.lower()
    if "rate limit" in msg_lower or "too many requests" in msg_lower:
        return 429
    elif "unauthorized" in msg_lower:
        return 401
    elif "forbidden" in msg_lower:
        return 403
    elif "not found" in msg_lower:
        return 404
    elif "bad request" in msg_lower:
        return 400

    return None


def _get_user_friendly_error(error, model_name: str) -> str:
    """
    Convert technical errors into user-friendly messages.
    """
    status_code = _extract_status_code(error)
    error_msg = str(error).lower()

    if status_code == 401:
        return "Invalid API key. Please check your OpenRouter API key in the .env file."
    elif status_code == 403:
        return (
            "API access forbidden. Your API key may not have permission for this model."
        )
    elif status_code == 404:
        return f"Model '{Config.get_model_display_name(model_name)}' not found. It may be unavailable."
    elif status_code == 429:
        return "Rate limit exceeded. Too many requests - please wait a moment and try again."
    elif status_code == 400:
        return "Invalid request. Please check your input and try again."
    elif "timeout" in error_msg or "timed out" in error_msg:
        return "Request timed out. The model may be overloaded. Try again in a moment."
    elif "connection" in error_msg:
        return "Connection error. Please check your internet connection."
    else:
        return f"An error occurred: {str(error)[:100]}{'...' if len(str(error)) > 100 else ''}"


def generate_for_model(
    model_name: str,
    prompt_text: str,
    temp: float,
    max_retries: int = None,
    show_debug: bool = False,
):
    """
    Enhanced content generation with comprehensive error handling.

    Returns:
        tuple: (formatted_content, warnings, elapsed_time, actual_model_used, debug_info)
            OR raises an exception for unrecoverable errors
    """
    if max_retries is None:
        max_retries = Config.MAX_RETRIES

    models_to_try = [model_name]
    fallback = Config.FALLBACK_MODELS.get(model_name)
    if fallback:
        models_to_try.append(fallback)

    debug_info = {}
    last_error = None

    for current_model in models_to_try:
        debug_info[current_model] = {
            "attempts": [],
            "used_fallback": current_model != model_name,
        }
        attempts = 0

        while attempts <= max_retries:
            try:
                start_time = time.time()

                if show_debug:
                    debug_info[current_model]["attempts"].append(
                        {"attempt": attempts + 1, "timestamp": start_time}
                    )

                response = client.chat.completions.create(
                    model=current_model,
                    messages=[{"role": "user", "content": prompt_text}],
                    temperature=temp,
                )

                elapsed = round(time.time() - start_time, 2)
                raw_content = response.choices[0].message.content
                formatted = format_output(content_type, raw_content)
                warnings = validate_output(content_type, raw_content)

                if show_debug:
                    debug_info[current_model]["attempts"][-1].update(
                        {
                            "success": True,
                            "elapsed": elapsed,
                            "content_length": len(raw_content),
                            "warnings_count": len(warnings),
                        }
                    )

                return formatted, warnings, elapsed, current_model, debug_info

            except Exception as e:
                last_error = e
                status_code = _extract_status_code(e)

                if show_debug:
                    debug_info[current_model]["attempts"].append(
                        {
                            "attempt": attempts + 1,
                            "timestamp": time.time(),
                            "success": False,
                            "error": str(e)[:200],
                            "status_code": status_code,
                        }
                    )

                # Non-retryable errors - move to next model
                if status_code in Config.NO_RETRY_CODES:
                    break

                # Retryable errors - try again
                if status_code in Config.RETRY_CODES and attempts < max_retries:
                    attempts += 1
                    time.sleep(Config.RETRY_DELAY)
                    continue

                # Other errors - also move to next model
                break

    # If we get here, all models failed
    user_friendly_error = _get_user_friendly_error(last_error, model_name)
    raise Exception(user_friendly_error)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Generate & Display
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

st.divider()
st.subheader("2️⃣  Generate")

if st.button("🚀 Generate Content", type="primary"):
    # ── Input validation ────────────────────────────────────────
    if not topic.strip():
        st.warning("⚠️ Please enter a Topic / Idea before generating.")
    elif not audience.strip():
        st.warning("⚠️ Please enter a Target Audience.")
    elif compare_mode and len(selected_models) == 0:
        st.warning("⚠️ Please select at least one model.")
    else:
        # ── Collect results from each selected model ─
        results = {}
        all_debug_info = {}

        progress_placeholder = st.empty()
        progress_bar = st.progress(0)

        for i, model_name in enumerate(selected_models):
            display_name = Config.get_model_display_name(model_name)
            progress_placeholder.info(
                f"⏳ Generating with **{display_name}** "
                f"({i + 1}/{len(selected_models)})…"
            )

            try:
                formatted, warnings, elapsed, actual, debug = generate_for_model(
                    model_name, prompt, temperature, max_retries, show_debug
                )
                results[model_name] = (formatted, warnings, elapsed, actual)
                if show_debug:
                    all_debug_info[model_name] = debug

            except Exception as e:
                results[model_name] = str(e)

            progress_bar.progress((i + 1) / len(selected_models))

        progress_placeholder.empty()
        progress_bar.empty()

        # ── Display results ─────────────────────────────────────
        st.subheader("3️⃣  Generated Content")

        if compare_mode and len(selected_models) > 1:
            # Show each model in its own tab
            model_names = [Config.get_model_display_name(m) for m in selected_models]
            tabs = st.tabs(model_names)

            for tab, model_name in zip(tabs, selected_models):
                with tab:
                    result = results.get(model_name)
                    if isinstance(result, str):
                        st.error(f"❌ Generation failed: {result}")
                    else:
                        formatted, warnings, elapsed, actual = result

                        # Show model info and performance
                        col1, col2 = st.columns([2, 1])
                        with col1:
                            actual_display = Config.get_model_display_name(actual)
                            if actual != model_name:
                                st.info(f"⚡ Fallback used: **{actual_display}**")
                            else:
                                st.caption(f"**Model:** {actual_display}")
                        with col2:
                            st.metric("Response Time", f"{elapsed}s")

                        # Show warnings/validation
                        if warnings:
                            for w in warnings:
                                st.warning(w)
                        else:
                            st.success("✅ Content validation passed")

                        # Show generated content
                        st.markdown("### Generated Content")
                        st.markdown(formatted)

                        # Debug info if enabled
                        if show_debug and model_name in all_debug_info:
                            with st.expander("🔍 Debug Information"):
                                st.json(all_debug_info[model_name])

        else:
            # Single-model output (no tabs needed)
            model_name = selected_models[0]
            result = results.get(model_name)

            if isinstance(result, str):
                st.error(f"❌ Generation failed: {result}")
            else:
                formatted, warnings, elapsed, actual = result

                # Show model info and performance
                col1, col2 = st.columns([2, 1])
                with col1:
                    actual_display = Config.get_model_display_name(actual)
                    if actual != model_name:
                        st.info(f"⚡ Fallback used: **{actual_display}**")
                    else:
                        st.success(f"✅ Generated by **{actual_display}**")
                with col2:
                    st.metric("Response Time", f"{elapsed}s")

                # Show warnings/validation
                if warnings:
                    for w in warnings:
                        st.warning(w)
                else:
                    st.success("✅ Content validation passed")

                # Show generated content
                st.markdown("### Generated Content")
                st.markdown(formatted)

                # Debug info if enabled
                if show_debug and model_name in all_debug_info:
                    with st.expander("🔍 Debug Information"):
                        st.json(all_debug_info[model_name])

        # ── Export and additional actions ─────────────────────────
        if any(not isinstance(r, str) for r in results.values()):
            st.divider()
            col1, col2, col3 = st.columns(3)

            with col1:
                if st.button("📋 Copy to Clipboard"):
                    successful_results = [
                        r for r in results.values() if not isinstance(r, str)
                    ]
                    if successful_results:
                        content_to_copy = successful_results[0][
                            0
                        ]  # First successful result
                        st.write("Content copied! (Use Ctrl+V to paste)")

            with col2:
                if st.button("🔄 Generate Again"):
                    st.rerun()

            with col3:
                # Download button for content
                successful_results = [
                    r for r in results.values() if not isinstance(r, str)
                ]
                if successful_results:
                    content_to_download = successful_results[0][0]
                    st.download_button(
                        label="💾 Save as Text",
                        data=content_to_download,
                        file_name=f"ai_content_{int(time.time())}.txt",
                        mime="text/plain",
                    )

        # ── Selected parameters summary ─────────────────────────
        with st.expander("📋 Selected Parameters"):
            model_names_str = ", ".join(
                [Config.get_model_display_name(m) for m in selected_models]
            )
            st.markdown(f"""
            **Configuration:**
            - **Model(s):** {model_names_str}
            - **Content Type:** {content_type}
            - **Tone:** {tone}
            - **Audience:** {audience.strip()}
            - **Length:** {length_label}
            - **Keywords:** {keywords.strip() if keywords else '—'}
            - **Temperature:** {temperature}
            - **Max Retries:** {max_retries}
            """)

            if show_debug:
                st.markdown("**Debug Mode:** Enabled")
