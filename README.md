# AI Content Generator

An AI-powered content generator that uses multiple large language models (LLMs) through the OpenRouter API. It features a Streamlit web app with dynamic prompting, multi-model comparison, and smart prompt suggestions.

## Features

-   **Dynamic Prompting (Task 2.1 & 2.2):** Configure content type, tone, audience, length, and keywords — the app builds an optimized prompt automatically.
-   **Multi-Model Comparison:** Toggle "Compare Across Multiple Models" to generate content from all selected models side-by-side in tabs.
-   **Prompt Suggestions:** Pick from 8 preset ideas (Instagram Ad, Product Launch, etc.) or click "Generate Random Idea" for instant inspiration.
-   **Live Prompt Preview:** See the dynamically constructed prompt update in real-time as you change inputs.
-   **Content Validation:** Automatic checks per content type — emails must have a Subject line, LinkedIn posts need hashtags, ads need a CTA.
-   **Post-Processing:** Output is formatted per content type (bold subject lines, emphasized CTAs, etc.).
-   **Multiple Interfaces:** Web app (Streamlit), CLI script, and model comparison script.
-   **Environment-Based Configuration:** API keys managed via `.env` file.

## Project Structure

```
.
├── .env                    # API keys and environment variables
├── .venv/                  # Virtual environment
├── app.py                  # Streamlit web application (main UI)
├── prompt_templates.py     # Dynamic prompt builder, formatter, and validator
├── generate_content.py     # CLI script for content generation
├── compare_models.py       # Side-by-side model comparison script
├── requirements.txt        # Python dependencies
├── Milestone_1_Report.md   # Project milestone report
└── README.md               # This file
```

## Setup

Follow these steps to set up and run the project on your local machine.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-content-generator
```

### 2. Create a Virtual Environment

It is highly recommended to use a virtual environment to manage the project's dependencies.

```bash
python -m venv .venv
```

### 3. Activate the Virtual Environment

-   **On Windows:**
    ```bash
    .venv\Scripts\activate
    ```
-   **On macOS and Linux:**
    ```bash
    source .venv/bin/activate
    ```

### 4. Install Dependencies

Install all the required Python packages using pip.

```bash
pip install -r requirements.txt
```

### 5. Set Up Environment Variables

Create a `.env` file in the root of the project and add your OpenRouter API key.

```env
OPENROUTER_API_KEY="your-openrouter-api-key"
```

## Usage

You can generate content using the Streamlit web app, the CLI script, or the comparison script.

### Using the Streamlit Web App

1.  **Run the app:**
    ```bash
    streamlit run app.py
    ```
2.  **Open your browser:** Navigate to `http://localhost:8501`.
3.  **Configure your content:**
    -   Choose a **Content Type** (LinkedIn Post, Professional Email, or Advertisement Copy).
    -   Set the **Tone** (Professional, Casual, Persuasive, or Friendly).
    -   Enter a **Target Audience** and **Topic / Idea**.
    -   Optionally add **Keywords** and adjust **Content Length**.
4.  **Use Prompt Suggestions:** Pick a preset from the dropdown or click **"Generate Random Idea"**.
5.  **Preview the prompt:** Expand the "Generated Prompt Preview" section to see the assembled prompt.
6.  **Multi-model comparison:** Check "Compare Across Multiple Models" to generate from several models in tabs.
7.  **Generate:** Click **"Generate Content"** to see the output with validation results.

### Using the Command-Line Script

```bash
# Dynamic prompt (recommended)
python generate_content.py "deepseek/deepseek-chat" \
  --topic "AI study planner app" \
  --type "LinkedIn Post" \
  --tone "Professional" \
  --audience "college students" \
  --length "Medium" \
  --keywords "AI, productivity"

# Manual prompt
python generate_content.py "deepseek/deepseek-chat" \
  --prompt "Write a short story about a robot who discovers music."
```

### Using the Model Comparison Script

```bash
python compare_models.py
```

Generates the same prompt across all three models and prints outputs side-by-side.

## Available Models

-   `deepseek/deepseek-chat`
-   `mistralai/mistral-7b-instruct`
-   `openai/gpt-oss-120b:free`

For more models, see the [OpenRouter documentation](https://openrouter.ai/docs).
