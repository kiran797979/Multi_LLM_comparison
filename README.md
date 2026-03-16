# AI Content Studio

AI Content Studio is a full-stack internship project for generating, comparing, and analyzing AI-written content.

- Frontend: React + TypeScript + Vite + Tailwind
- Backend: Python + Streamlit + OpenRouter API
- Milestone: M3 (feature-complete update branch)

## Project Highlights

- Multi-model content generation with model switching
- A/B output comparison with word-level diff
- Dynamic prompt builder (auto-generated + user-editable)
- Built-in text analysis (readability and quality indicators)
- Templates modal for quick-start workflows
- Command palette for keyboard-first actions
- Login flow with animated UI and protected app route
- Local history + draft autosave

## Tech Stack

### Frontend

- React 19
- TypeScript 5
- Vite 7
- Tailwind CSS 3
- Framer Motion
- GSAP
- React Router

### Backend

- Python 3.10+
- Streamlit
- OpenAI SDK (used with OpenRouter base URL)
- python-dotenv

## Repository Structure

```text
ai-content-studio/
├── src/                         # Frontend source
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   └── ...
├── backend/                     # Streamlit + content generation backend
│   ├── app.py
│   ├── config.py
│   ├── compare_models.py
│   ├── generate_content.py
│   ├── prompt_templates.py
│   └── requirements.txt
├── public/
├── .env.example                 # Frontend env template
└── README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- Python 3.10+
- OpenRouter API key

## Setup

### 1) Clone

```bash
git clone https://github.com/Springboard-Internship-2025/Developing-an-AI-System-for-Personalized-Content-Creation-in-Media_Feb_Batch-8_2026.git
cd Developing-an-AI-System-for-Personalized-Content-Creation-in-Media_Feb_Batch-8_2026
```

### 2) Frontend Setup

```bash
npm install
```

Create `.env` from `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8501
VITE_USE_MOCK=true
```

Run frontend:

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 3) Backend Setup

```bash
cd backend
python -m venv venv
```

Activate virtual environment:

- Windows (PowerShell):
```powershell
.\venv\Scripts\Activate.ps1
```

- Windows (cmd):
```bat
venv\Scripts\activate
```

- macOS/Linux:
```bash
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Create `backend/.env` from `backend/.env.example` and set:

```env
OPENROUTER_API_KEY=your-openrouter-api-key
# optional
# DEFAULT_MODEL=deepseek/deepseek-chat
# DEFAULT_TEMPERATURE=0.7
```

Run backend:

```bash
streamlit run app.py
```

Backend runs at: `http://localhost:8501`

## Running Modes

### Mock Mode (Frontend only)

Use when backend is not running:

```env
VITE_USE_MOCK=true
```

### Full-Stack Mode (Real API)

Use frontend with backend:

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8501
```

## Available Commands

### Frontend (root)

- `npm run dev` — start Vite dev server
- `npm run build` — type-check and production build
- `npm run lint` — lint project
- `npm run preview` — preview production build

### Backend (`backend/`)

- `streamlit run app.py` — launch backend UI
- `python generate_content.py ...` — generate content from CLI
- `python compare_models.py` — compare outputs across models

## API Contract (Frontend → Backend)

Endpoint used by frontend:

- `POST /generate`

Request payload shape:

```json
{
  "contentType": "linkedin",
  "tone": "professional",
  "length": "medium",
  "targetAudience": "Marketing professionals",
  "keywords": "AI, productivity",
  "topic": "Future of AI content",
  "model": "deepseek/deepseek-chat",
  "prompt": "...final prompt text..."
}
```

Expected response:

```json
{
  "content": "Generated text..."
}
```

## Milestone 3 Status

Milestone 3 implementation is complete in this codebase and submitted through feature branch:

- `ManojKiran_m3`

## Troubleshooting

- If frontend cannot reach backend, verify `VITE_API_BASE_URL` and backend port.
- If generation fails with API errors, verify `OPENROUTER_API_KEY` in `backend/.env`.
- If dependencies fail, recreate virtual environment and reinstall requirements.

## License

This repository is for internship/project submission use.
