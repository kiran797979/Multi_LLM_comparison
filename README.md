# AI Content Studio

A production-oriented, full-stack AI content generation studio. Generate, compare, and analyze content across multiple LLM models with a premium interactive UI.

> **Author:** B M Kiran
> **Repository:** [kiran797979/AI_CONTENT_CREATOR](https://github.com/kiran797979/AI_CONTENT_CREATOR)

---

## 🚀 Overview

AI Content Studio supports a professional content drafting workflow:
- **Multi-Model Generation:** Use DeepSeek, Gemini, GPT, Llama, Mistral, and Qwen via OpenRouter.
- Backend API: `https://ai-content-creator-api-u9hy.onrender.com`
- Backend Health: `https://ai-content-creator-api-u9hy.onrender.com/health`
- **A/B Comparison:** Side-by-side output comparison with word-level diff highlighting.
- **Smart Analysis:** Real-time readability scores (Flesch), tone analysis, and text metrics.
- **Modern UX:** Interactive GSAP-animated login, ⌘K command palette, and a pixel-retro landing page.

---

## ✨ Features

### Content Creation & AI
- **12+ Content Types:** LinkedIn Posts, Emails, Ad Copy, Blog Posts, Social Media, and more.
- **Dynamic Prompt Builder:** Auto-generated prompts from form fields that remain fully user-editable.
- **Advanced Controls:** Customize Tone (Professional, Witty, Persuasive) and Length (Short to Extended).
- **Template Library:** Searchable library of professional content templates.

### User Experience
- **Interactive Landing Page:** `/welcome` route featuring 3D Spline interactive scenes and a nostalgic Pixel/Retro theme.
- **Command Palette:** `⌘K` or `Ctrl+K` for keyboard-first navigation and actions.
- **Lamp Login:** GSAP-animated interaction with a draggable light cord and randomized glow effects.
- **Autosave & History:** Local persistence for drafts and 50+ generation history entries.

### Easter Egg
- **Surf Runner:** A high-performance canvas-based surf game with physics, obstacles, and powerups.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **TypeScript 5**
- **Vite 7** (Build & Dev Server)
- **Tailwind CSS 3.4** (Styling)
- **Framer Motion 12** (UI Transitions)
- **GSAP 3** (Custom Animations)
- **@splinetool/react-spline** (3D Integration)

### Backend
- **Python 3.10+**
- **FastAPI** (Frontend API Integration)
- **Streamlit** (Companion Dashboard)
- **OpenAI SDK** (OpenRouter Gateway)
- **Render** (Production Deployment)

---

## 📂 Project Structure

```text
ai-content-studio/
├── src/                             # React frontend source
│   ├── components/                  # Feature components (ABComparison, CommandPalette, etc.)
│   ├── ui/                          # Reusable UI primitives (Dropdown, TextInput)
│   ├── pages/                       # Route pages (LandingPage at /welcome)
│   ├── hooks/                       # Custom hooks (useAutoSave, useToast)
│   ├── services/                    # API services (api.ts)
│   ├── utils/                       # Logical utilities (textAnalysis, textDiff)
│   └── App.tsx                      # Root orchestration
├── backend/                         # Python backend
│   ├── api.py                       # FastAPI application
│   ├── app.py                       # Streamlit application
│   ├── config.py                    # Environment & configuration
│   ├── prompt_templates.py          # Dynamic prompt engine
│   └── requirements.txt             # Python dependencies
├── vercel.json                      # Vercel deployment config
└── README.md                        # Documentation
```

---

## 🏁 Quick Start

### 1) Clone the Repository
```bash
git clone https://github.com/kiran797979/AI_CONTENT_CREATOR.git
cd AI_CONTENT_CREATOR
```

### 2) Frontend Setup
```bash
# Install dependencies
npm install

# Configure environment
# Create .env from .env.example
# Set VITE_API_BASE_URL=https://ai-content-creator-api-u9hy.onrender.com
# Set VITE_USE_MOCK=false to use real AI generation

# Start dev server
npm run dev
```

### 3) Backend Setup
```bash
cd backend
python -m venv .venv

# Activate environment
# Windows: .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
python run_api.py
```

---

## 📝 Environment Variables

### Frontend (`.env`)
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the FastAPI backend |
| `VITE_USE_MOCK` | Set to `true` for local development without an API key |

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `OPENROUTER_API_KEY` | Your API key from [OpenRouter](https://openrouter.ai/) |
| `DEFAULT_MODEL` | The default AI model to use for generation |

---

## 📜 License
MIT License. Created by [B M Kiran](https://github.com/kiran797979).
