# AI Content Studio

AI Content Studio is a full-stack project for generating, comparing, and analyzing AI-written content.

- Frontend: React + TypeScript + Vite + Tailwind
- Backend API: FastAPI + OpenRouter (OpenAI SDK)
- Backend UI: Streamlit (optional companion interface)
- Milestone branch: `ManojKiran_m3`

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Contract](#api-contract)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

This project supports a complete content workflow:
- Generate content from multiple LLMs
- Compare A/B outputs with diffing
- Analyze readability and quality
- Use templates, command palette, and autosave for faster drafting

Frontend users interact with a modern dashboard and a public landing page (`/welcome`).
The frontend calls the FastAPI backend at `POST /generate`, and the backend routes requests to OpenRouter.

## Features

### Frontend

- Public startup landing page (`/welcome`, alias `/landing`)
- Login page and protected dashboard route (`/`)
- Dynamic prompt builder (auto + editable)
- A/B model comparison and output tabs
- Text analysis and content utilities
- Local autosave and content history
- Pixel/retro themed landing experience (landing only)

### Backend

- FastAPI endpoint for frontend integration (`/generate`)
- Health check endpoint (`/health`)
- Content/tone/length/model mapping layer
- OpenRouter integration through OpenAI SDK
- Optional Streamlit interface for standalone usage
- CLI scripts for generation and model comparison

## Architecture

```text
React App (Vite)  --->  FastAPI (/generate)  --->  OpenRouter API  --->  LLM
       |                      |
       |                      +--> prompt templates + validation/mapping
       |
       +--> optional mock mode (frontend only)

Optional parallel backend UI:
Streamlit app.py (same environment/config)
```

## Tech Stack

### Frontend

- React 19
- TypeScript 5
- Vite 7
- Tailwind CSS 3
- Framer Motion
- GSAP
- React Router
- `@splinetool/react-spline`

### Backend

- Python 3.10+
- FastAPI
- Uvicorn
- Streamlit
- OpenAI SDK (with OpenRouter base URL)
- python-dotenv

## Project Structure

```text
ai-content-studio/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   │   └── LandingPage.tsx
│   ├── services/
│   ├── utils/
│   └── ...
├── backend/
│   ├── api.py                # FastAPI adapter for frontend
│   ├── run_api.py            # local API runner
│   ├── app.py                # Streamlit app
│   ├── config.py
│   ├── generate_content.py   # CLI content generation
│   ├── compare_models.py     # CLI model comparison
│   ├── prompt_templates.py
│   ├── requirements.txt
│   └── .env.example
├── public/
├── .env.example
├── vercel.json
└── README.md
```

## Quick Start

## 1) Clone

```bash
git clone https://github.com/Springboard-Internship-2025/Developing-an-AI-System-for-Personalized-Content-Creation-in-Media_Feb_Batch-8_2026.git
cd Developing-an-AI-System-for-Personalized-Content-Creation-in-Media_Feb_Batch-8_2026
```

## 2) Frontend setup

```bash
npm install
```

Create root `.env` from `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK=false
```

Run frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

## 3) Backend setup

```bash
cd backend
python -m venv .venv
```

Activate environment:

- Windows PowerShell: `\.venv\Scripts\Activate.ps1`
- Windows cmd: `.venv\Scripts\activate`
- macOS/Linux: `source .venv/bin/activate`

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Create `backend/.env` from `backend/.env.example` and set:

```env
OPENROUTER_API_KEY=your-openrouter-api-key
# Optional:
# DEFAULT_MODEL=deepseek/deepseek-chat
# DEFAULT_TEMPERATURE=0.7
# CORS_ORIGINS=http://localhost:5173
```

Run backend API:

```bash
python run_api.py
```

Backend API URL: `http://localhost:8000`

Optional Streamlit UI:

```bash
streamlit run app.py
```

Streamlit URL: `http://localhost:8501`

## Configuration

### Frontend environment

- `VITE_API_BASE_URL` — FastAPI base URL
- `VITE_USE_MOCK` — `true` to bypass backend and use mock generation

### Backend environment

- `OPENROUTER_API_KEY` (required)
- `DEFAULT_MODEL` (optional)
- `DEFAULT_TEMPERATURE` (optional)
- `CORS_ORIGINS` (optional, comma-separated)

Example:

```env
CORS_ORIGINS=http://localhost:5173,https://your-frontend-domain.vercel.app
```

## Usage

### App routes

- `/welcome` or `/landing` — public landing page
- `/login` — login page
- `/` — protected dashboard

### CLI examples (backend)

Generate content:

```bash
python generate_content.py "deepseek/deepseek-chat" --topic "AI productivity for marketers" --type "Blog Post" --tone "Professional" --audience "Marketing teams" --length "Medium" --keywords "AI, productivity"
```

Compare models:

```bash
python compare_models.py --prompt "Create a launch announcement for an AI content platform"
```

## API Contract

### `POST /generate`

Request body:

```json
{
  "contentType": "linkedin",
  "tone": "professional",
  "length": "medium",
  "targetAudience": "Marketing professionals",
  "keywords": "AI, productivity",
  "topic": "Future of AI content",
  "model": "deepseek/deepseek-r1",
  "prompt": ""
}
```

Response body:

```json
{
  "content": "Generated text..."
}
```

Health check:

- `GET /health` → `{ "status": "ok" }`

## Deployment

### Recommended setup

- Frontend: Vercel
- Backend API: Render Web Service

### Deploy backend (Render)

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn api:app --host 0.0.0.0 --port $PORT`
- Required env:
  - `OPENROUTER_API_KEY=...`
  - `CORS_ORIGINS=https://your-frontend-domain.vercel.app`

### Deploy frontend (Vercel)

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Env:
  - `VITE_USE_MOCK=false`
  - `VITE_API_BASE_URL=https://your-render-service.onrender.com`

This repo includes `vercel.json` rewrite rules so SPA routes like `/welcome` and `/login` work on refresh.

### Post-deploy verification

1. Open backend health URL: `https://your-render-service.onrender.com/health`
2. Confirm response: `{ "status": "ok" }`
3. Open frontend and run one real generation
4. Confirm browser console has no CORS/API errors

## Troubleshooting

- **CORS error in browser**
  - Ensure backend `CORS_ORIGINS` includes your exact frontend domain.
- **`OPENROUTER_API_KEY` missing/invalid**
  - Verify key in `backend/.env` (local) or hosting env vars (production).
- **Frontend calls wrong URL**
  - Recheck `VITE_API_BASE_URL` and redeploy frontend after env update.
- **Generation returns empty/error**
  - Check backend logs and model ID mapping in `backend/api.py`.
- **Route refresh 404 on frontend**
  - Ensure `vercel.json` is present and deployed.

---

If you want, I can now commit this README improvement and push it to both `origin` and `personal` on `ManojKiran_m3`.
