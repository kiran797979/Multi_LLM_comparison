# ✍️ AI Content Generator

> A powerful, intelligent content generation platform that leverages multiple AI models to create tailored content for any purpose.

[![Streamlit App](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](http://localhost:8501)
[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![OpenRouter](https://img.shields.io/badge/API-OpenRouter-green.svg)](https://openrouter.ai/)

## 🌟 Features

### 🎯 **Intelligent Content Generation**
- **12 Content Types**: LinkedIn posts, emails, blog posts, social media, product descriptions, press releases, and more
- **12 Tone Options**: Professional, casual, persuasive, humorous, authoritative, and beyond
- **6 Length Settings**: From very short snippets to extended multi-paragraph content
- **Smart Validation**: Automatic content quality checks specific to each content type

### 🤖 **Multi-Model AI Power**
- **6 Premium Models**: DeepSeek, Mistral, GPT, LLaMA, Gemini, and Qwen
- **Model Comparison**: Generate content from multiple models simultaneously
- **Automatic Fallbacks**: Seamless switching if a model fails
- **Performance Metrics**: Real-time response times and model analytics

### 💡 **Enhanced User Experience**
- **Beautiful UI**: Modern, gradient-rich interface with intuitive design
- **Smart Suggestions**: 15+ categorized prompt templates for instant inspiration
- **Random Ideas**: AI-powered random topic generation for creative blocks
- **Live Preview**: Real-time prompt construction with word/character counts
- **Export Options**: Save, copy, or download generated content

### ⚙️ **Advanced Configuration**
- **Temperature Control**: Fine-tune creativity levels (0.0-2.0)
- **Retry Logic**: Automatic retry with exponential backoff
- **Debug Mode**: Detailed technical information for power users
- **Environment Management**: Secure API key handling with `.env` files

## 🚀 Quick Start

### 1. **Clone & Setup**
```bash
git clone <repository-url>
cd ai-content-generator
python -m venv .venv
```

### 2. **Activate Environment**

**Windows:**
```bash
.venv\Scripts\activate
```

**macOS/Linux:**
```bash
source .venv/bin/activate
```

### 3. **Install Dependencies**
```bash
pip install -r requirements.txt
```

### 4. **Configure API**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your OpenRouter API key
# Get your key from: https://openrouter.ai/
OPENROUTER_API_KEY="your-actual-api-key-here"
```

### 5. **Launch the App**
```bash
streamlit run app.py
```

Visit `http://localhost:8501` to start generating amazing content! 🎉

## 📱 Usage

### Web Interface (Recommended)

1. **Choose Your Models**: Select single or multiple AI models for comparison
2. **Configure Content**: Pick content type, tone, length, and target audience  
3. **Add Your Topic**: Use suggestions, random ideas, or write your own
4. **Generate**: Watch as AI creates tailored content in seconds
5. **Export**: Save, copy, or download your generated content

### Command Line Interface

Generate content directly from the terminal:

```bash
# Quick generation with preset prompt
python generate_content.py "deepseek/deepseek-chat" --prompt "Write a LinkedIn post about AI"

# Dynamic prompt building
python generate_content.py "mistralai/mistral-7b-instruct" \
  --type "Blog Post" \
  --tone "Professional" \
  --audience "Tech professionals" \
  --length "Medium" \
  --keywords "AI, productivity" \
  --topic "How AI is transforming workplace efficiency"
```

### Model Comparison

Compare multiple models side-by-side:

```bash
python compare_models.py --prompt "Write an engaging product launch announcement"
```

## 🎨 Content Types & Capabilities

| Content Type | Features | Validation |
|--------------|----------|------------|
| **LinkedIn Post** | Professional tone, hashtags, engagement hooks | ✅ Hashtag check, length optimization |
| **Professional Email** | Subject lines, formal structure | ✅ Subject line validation |
| **Blog Post** | Headlines, subheadings, SEO-friendly | ✅ Structure and length checks |
| **Social Media** | Emojis, hashtags, engagement CTAs | ✅ Hashtag and emoji validation |
| **Product Description** | Benefits focus, specifications, buying reasons | ✅ Benefits vs features emphasis |
| **Advertisement Copy** | Persuasive language, clear CTAs | ✅ CTA presence verification |
| **Press Release** | Professional format, quotes, contact info | ✅ Format and quote validation |
| **Newsletter** | Personal tone, value-driven content | ✅ Content value assessment |
| **Tweet Thread** | Numbered tweets, character limits | ✅ Threading and length validation |
| **YouTube Description** | Timestamps, links, keywords | ✅ Timestamp and structure checks |
| **Sales Pitch** | Problem-solution format, objection handling | ✅ CTA and benefits validation |
| **Landing Page** | Headlines, benefits, urgency | ✅ Conversion optimization checks |

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with these settings:

```bash
# Required: OpenRouter API key
OPENROUTER_API_KEY="your-openrouter-api-key"

# Optional: Default settings
DEFAULT_MODEL="deepseek/deepseek-chat"
DEFAULT_TEMPERATURE=0.7

# Optional: Streamlit configuration
STREAMLIT_PORT=8501
STREAMLIT_HOST=localhost
```

### Advanced Settings

- **Temperature**: Control creativity (0.0 = focused, 2.0 = highly creative)
- **Max Retries**: Set retry attempts for failed requests (0-5)
- **Debug Mode**: Enable detailed technical information
- **Fallback Models**: Automatic model switching for reliability

## 📁 Project Structure

```
ai-content-generator/
├── 📄 app.py                   # Main Streamlit web application
├── 📄 config.py                # Configuration management
├── 📄 prompt_templates.py      # Dynamic prompt engine & validation
├── 📄 generate_content.py      # CLI content generation
├── 📄 compare_models.py        # Multi-model comparison tool
├── 📄 requirements.txt         # Python dependencies
├── 📄 .env.example            # Environment template
├── 📁 .venv/                  # Virtual environment
└── 📄 README.md               # This documentation
```

## 🤖 Supported AI Models

| Model | Provider | Strengths | Best For |
|-------|----------|-----------|----------|
| **DeepSeek Chat** | DeepSeek | Reasoning, analysis | Technical content, explanations |
| **Mistral 7B** | Mistral AI | Balanced, efficient | General content, quick generation |
| **GPT OSS 120B** | OpenAI | Large context, versatility | Long-form content, complex tasks |
| **LLaMA 3.2 90B** | Meta | Advanced reasoning | Creative writing, storytelling |
| **Gemini Flash 1.5** | Google | Speed, multimodal | Fast content, structured output |
| **Qwen 2.5 72B** | Alibaba | Multilingual, technical | International content, coding |

## 🎯 Best Practices

### 🏆 **Prompt Writing Tips**

- **Be Specific**: "Marketing professionals in SaaS" vs "business people"
- **Include Context**: Mention your industry, company size, or brand voice  
- **Use Keywords**: Add relevant terms naturally for better SEO
- **Set Expectations**: Specify exactly what you want (length, format, style)
- **Test Temperatures**: Start with 0.7, go higher for creativity, lower for consistency

### 📊 **Model Selection Guide**

- **Quick Content**: Mistral 7B or Gemini Flash
- **Creative Writing**: LLaMA 3.2 or higher temperature settings
- **Technical Content**: DeepSeek Chat or GPT models
- **Comparative Analysis**: Use multi-model mode to find your preference
- **Professional Content**: Lower temperature (0.3-0.5) for consistency

### ✅ **Quality Optimization**

- **Use Validation**: Review warnings and suggestions
- **Iterate**: Adjust temperature and prompts based on results  
- **Compare**: Use multi-model mode to find the best output
- **Export**: Save successful prompts and settings for future use
- **Review**: Always review generated content before publishing

## 🔧 Troubleshooting

### Common Issues

**API Key Errors:**
- Verify your `.env` file exists and contains the correct key
- Check that your OpenRouter account has credits
- Ensure the key has proper permissions

**Model Failures:**
- Use fallback models for reliability
- Check OpenRouter status page for model availability
- Try different models if one is consistently failing

**Slow Generation:**
- Reduce content length for faster responses
- Use lighter models (Mistral 7B, Gemini Flash)
- Lower temperature for more deterministic responses

**Memory Issues:**
- Reduce the number of models in comparison mode
- Clear browser cache and restart the app
- Check available system memory

## 🚀 Advanced Usage

### Custom Model Configuration

Add new models in `config.py`:

```python
AVAILABLE_MODELS = [
    "your/custom-model",
    # ... existing models
]

FALLBACK_MODELS = {
    "your/custom-model": "deepseek/deepseek-chat",
}
```

### Extending Content Types

Add new content types in `prompt_templates.py`:

```python
# Add to CONTENT_TYPES list
CONTENT_TYPES = [
    # ... existing types
    "Your New Content Type",
]

# Add specific rules in build_prompt function
elif content_type == "Your New Content Type":
    type_rules = (
        "Write your new content type.\n"
        "Rules:\n"
        "- Your specific rule 1\n"
        "- Your specific rule 2\n"
    )
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenRouter** for providing access to multiple AI models
- **Streamlit** for the amazing web framework
- **The AI Community** for inspiration and feedback

---

<div align="center">

**Made with ❤️ by the AI Content Generator Team**

*Empowering creators with intelligent content generation*

[Report Bug](../../issues) · [Request Feature](../../issues) · [Documentation](README.md)

</div>

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
