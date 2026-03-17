# 🎨 AI Content Studio

<div align="center">

[![Live Site](https://img.shields.io/badge/Live%20Site-Vercel-black?style=for-the-badge&logo=vercel)](https://ai-content-creator-pi.vercel.app/welcome)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://ai-content-creator-api-u9hy.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

**A production-grade AI content generation platform with a First-to-Finish model race engine, pixel-retro aesthetics, and zero-friction UX.**

[🌐 Live Demo](https://ai-content-creator-pi.vercel.app/welcome) · [🔗 Backend API](https://ai-content-creator-api-u9hy.onrender.com) · [📖 API Docs](https://ai-content-creator-api-u9hy.onrender.com/docs)

</div>

---

## 👥 Contributors

| Name | Role |
|---|---|
| **Manoj Kiran** | Lead Developer & Architect |
| **Sneha Deepika** | Frontend Developer |
| **Sathvika** | UI/UX Designer |
| **Ushasri** | Content Strategist |

---

## 🚀 Overview

AI Content Studio is a full-stack AI content generation platform that uses a novel **"First-to-Finish" race architecture** — simultaneously querying multiple free AI models and returning the fastest valid response. This means zero waiting for slow models and automatic fallback if a model is rate-limited.

| Service | URL |
|---|---|
| 🌐 Frontend (Vercel) | https://ai-content-creator-pi.vercel.app/welcome |
| ⚡ Backend API (Render) | https://ai-content-creator-api-u9hy.onrender.com |
| 🏥 Health Check | https://ai-content-creator-api-u9hy.onrender.com/health |
| 📖 API Docs (Swagger) | https://ai-content-creator-api-u9hy.onrender.com/docs |

---

## 🏁 First-to-Finish Race Architecture

The backend races **5 free models simultaneously** via OpenRouter. The first to return a valid response wins; all others are immediately cancelled to save API credits.

```
User clicks "Generate"
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│                   🏁 THE RACE STARTS                    │
│                                                         │
│  ⚡ Gemma 3 12B      ──────────────────► [?]            │
│  ⚡ Llama 3.2 3B     ─────────► [WINNER! ✅]            │
│  ⚡ MiniMax M2.5     ──────────────────────────► [?]    │
│  ⚡ Gemma 3 4B       ───────────────────► [?]           │
│  ⚡ Gemma 3n 4B      ──────────────────────► [?]        │
└─────────────────────────────────────────────────────────┘
        │ Winner's content returned instantly
        │ All other tasks cancelled to save credits
        ▼
   Content shown to user
```

### 🤖 Racer Models (All Free via OpenRouter)

| Model | Provider | Strength |
|---|---|---|
| `google/gemma-3-12b-it:free` | Google | High quality, reasoning |
| `meta-llama/llama-3.2-3b-instruct:free` | Meta | Ultra-fast speed |
| `minimax/minimax-m2.5:free` | MiniMax | Office/document tasks |
| `google/gemma-3-4b-it:free` | Google | Balanced speed + quality |
| `google/gemma-3n-4b-it:free` | Google | Efficiency optimized |

---

## ✨ Feature Set

### 🤖 AI Content Generation
- **12 Content Types:** LinkedIn Posts, Professional Emails, Blog Articles, Social Media Captions, Product Descriptions, Ad Copy, Press Releases, Newsletters, Tweet Threads, YouTube Descriptions, Sales Pitches, Landing Page Copy
- **Dynamic Prompt Builder:** Auto-generates structured prompts from form fields, fully user-editable before generation
- **Tone Control:** Professional, Casual, Formal, Friendly, Persuasive, Informative
- **Length Control:** Short, Medium, Long — with context-aware line-count targets
- **Keyword Integration:** Smart organic keyword weaving into generated content

### 🎨 User Interface
- **Pixel Retro Landing Page** at `/welcome` — nostalgic pixel art theme with contributors section
- **Interactive GSAP Login** — draggable lamp cord animation with randomized neon glow; form revealed instantly on page load
- **Command Palette** — `⌘K` / `Ctrl+K` for power users to generate, copy, download without touching the mouse
- **A/B Content Comparison** — side-by-side diff view with word-level highlighting
- **Smart Analysis Panel** — Flesch readability scores, word count, estimated read time, and tone detection
- **Template Library** — Searchable pre-built templates across all 12 content types

### 💾 Persistence & Productivity
- **Auto-Save Drafts** — Workspace state persisted to `localStorage` automatically
- **Generation History** — Last 50 generations stored, viewable in the sidebar
- **Export Options** — Download content as `.txt` or `.md` via one-click buttons

### 🎮 Easter Egg
- **Surf Runner Game** — Hidden canvas-based game with physics, obstacles, and progressively increasing difficulty

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | Core UI framework |
| **TypeScript** | 5 | Type safety |
| **Vite** | 7 | Build tool & dev server |
| **Tailwind CSS** | 3.4 | Utility-first styling |
| **Framer Motion** | 12 | Page & component transitions |
| **GSAP** | 3 | Custom animations (login, scroll) |
| **Spline** | latest | 3D interactive scenes |
| **React Router** | 6 | Client-side routing |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.14 | Runtime |
| **FastAPI** | latest | Async REST API framework |
| **Uvicorn** | latest | ASGI server |
| **AsyncOpenAI SDK** | latest | OpenRouter async API calls |
| **python-dotenv** | latest | Environment management |
| **Pydantic** | v2 | Request/response validation |

### Infrastructure
| Service | Purpose |
|---|---|
| **Vercel** | Frontend deployment (CDN + edge) |
| **Render** | Backend deployment (free tier) |
| **OpenRouter** | Multi-model AI gateway (100% free models) |
| **GitHub** | Source control & CI/CD trigger |

---

## 📂 Project Structure

```
ai-content-studio/
├── src/                              # React frontend source
│   ├── components/
│   │   ├── LoginPage.tsx             # GSAP lamp-cord login animation
│   │   ├── ContentForm.tsx           # Main content generation form
│   │   ├── ABComparison.tsx          # Side-by-side content diff
│   │   ├── CommandPalette.tsx        # ⌘K keyboard command hub
│   │   ├── TemplateSelector.tsx      # Searchable template library
│   │   ├── HistorySidebar.tsx        # Generation history panel
│   │   └── SurfGame.tsx             # Easter egg canvas game
│   ├── pages/
│   │   └── LandingPage.tsx          # Pixel-retro landing at /welcome
│   ├── hooks/
│   │   ├── useAutoSave.ts            # Auto-persist draft to localStorage
│   │   ├── useHistory.ts             # Generation history management
│   │   └── useToast.ts              # Notification system
│   ├── services/
│   │   └── api.ts                   # API client with retry logic
│   ├── types/
│   │   └── form.ts                  # Types, defaults & validation rules
│   ├── config/
│   │   └── env.ts                   # Environment variable access
│   └── App.tsx                      # Root app + state orchestration
├── backend/
│   ├── api.py                       # FastAPI app with Race Engine 🏁
│   ├── config.py                    # Environment & config class
│   ├── prompt_templates.py          # Dynamic prompt builder engine
│   └── requirements.txt             # Python dependencies
├── public/                          # Static assets
├── vercel.json                      # SPA rewrite rules for Vercel
├── vite.config.ts                   # Vite build configuration
└── README.md                        # This file
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

# Create your environment file
cp .env.example .env

# Edit .env:
# VITE_API_BASE_URL=https://ai-content-creator-api-u9hy.onrender.com
# VITE_USE_MOCK=false

# Start dev server
npm run dev
# → Opens at http://localhost:5173
```

### 3) Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Mac/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env

# Start FastAPI server
uvicorn api:app --reload --port 8000
# → API available at http://localhost:8000
# → Swagger UI at http://localhost:8000/docs
```

---

## 📝 Environment Variables

### Frontend (`.env`)
```env
VITE_API_BASE_URL=https://ai-content-creator-api-u9hy.onrender.com
VITE_USE_MOCK=false
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the FastAPI backend | — |
| `VITE_USE_MOCK` | `true` for offline/demo mode without an API key | `false` |

### Backend (`backend/.env`)
```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
CORS_ORIGINS=https://ai-content-creator-pi.vercel.app
```

| Variable | Description | Required |
|---|---|---|
| `OPENROUTER_API_KEY` | API key from [openrouter.ai](https://openrouter.ai/) | ✅ Yes |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | Optional |

---

## 🌐 API Reference

### `POST /generate`
Trigger the model race and return the first successful response.

**Request Body:**
```json
{
  "contentType": "blog",
  "tone": "professional",
  "length": "medium",
  "topic": "The future of AI",
  "targetAudience": "Tech professionals",
  "keywords": "AI, innovation, LLM",
  "prompt": ""
}
```

**Response:**
```json
{
  "content": "## Beyond Automation...\n\nAI is reshaping..."
}
```

### `GET /health`
Returns `{"status": "ok"}` if the service is running.

### `GET /docs`
Interactive Swagger UI for all endpoints.

---

## 🚢 Deployment

### Frontend → Vercel
1. Push to `main` branch on GitHub
2. Vercel auto-deploys from the repository root
3. Set `VITE_API_BASE_URL` and `VITE_USE_MOCK` in Vercel Environment Variables

### Backend → Render
1. Push to `main` branch on GitHub
2. Render auto-deploys from the `backend/` root directory
3. Set `OPENROUTER_API_KEY` and `CORS_ORIGINS` in Render Environment Variables
4. Start command: `uvicorn api:app --host 0.0.0.0 --port $PORT`

---

## 📜 License

MIT License — Created for the **Springboard Internship 2025** program.

> **Repository:** [kiran797979/AI_CONTENT_CREATOR](https://github.com/kiran797979/AI_CONTENT_CREATOR)
