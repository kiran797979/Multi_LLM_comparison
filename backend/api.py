from __future__ import annotations

import os
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from openai import OpenAI

from config import Config
from prompt_templates import build_prompt


app = FastAPI(title="AI Content Studio API", version="1.0.0")


def _parse_allowed_origins() -> list[str]:
    raw_value = os.getenv("CORS_ORIGINS", "")
    if raw_value.strip():
        return [origin.strip() for origin in raw_value.split(",") if origin.strip()]
    return ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    contentType: Literal[
        "linkedin",
        "email",
        "blog",
        "social-media",
        "product-description",
        "ad-copy",
        "press-release",
        "newsletter",
        "tweet-thread",
        "youtube-description",
        "sales-pitch",
        "landing-page",
    ]
    tone: Literal["professional", "casual", "persuasive", "informative", "friendly", "formal"]
    length: Literal["short", "medium", "long"]
    targetAudience: str = Field(default="")
    keywords: str = Field(default="")
    topic: str = Field(default="")
    model: str = Field(default="")
    prompt: str = Field(default="")


class GenerateResponse(BaseModel):
    content: str


CONTENT_TYPE_MAP = {
    "linkedin": "LinkedIn Post",
    "email": "Professional Email",
    "blog": "Blog Post",
    "social-media": "Social Media",
    "product-description": "Product Description",
    "ad-copy": "Advertisement Copy",
    "press-release": "Press Release",
    "newsletter": "Newsletter",
    "tweet-thread": "Tweet Thread",
    "youtube-description": "YouTube Description",
    "sales-pitch": "Sales Pitch",
    "landing-page": "Landing Page",
}

TONE_MAP = {
    "professional": "Professional",
    "casual": "Casual",
    "persuasive": "Persuasive",
    "informative": "Informative",
    "friendly": "Friendly",
    "formal": "Formal",
}

LENGTH_MAP = {
    "short": "Short",
    "medium": "Medium",
    "long": "Long",
}

MODEL_MAP = {
    "deepseek/deepseek-r1": "deepseek/deepseek-chat",
    "google/gemini-2.5-flash": "google/gemini-flash-1.5:free",
    "openai/gpt-4o-mini": "openai/gpt-oss-120b:free",
    "meta-llama/llama-3.2-90b": "meta-llama/llama-3.2-90b-vision-instruct:free",
    "mistralai/mistral-7b": "mistralai/mistral-7b-instruct:free",
    "qwen/qwen-2.5-72b": "qwen/qwen-2.5-72b-instruct:free",
}

PROMPT_TEMPLATE_CONTENT_TYPE_COMPAT_MAP = {
    "Social Media": "Social Media Caption",
    "Newsletter": "Newsletter Content",
    "Landing Page": "Landing Page Copy",
}


def _map_content_type(value: str) -> str:
    mapped = CONTENT_TYPE_MAP.get(value, value)
    return PROMPT_TEMPLATE_CONTENT_TYPE_COMPAT_MAP.get(mapped, mapped)


def _map_tone(value: str) -> str:
    return TONE_MAP.get(value, value)


def _map_length(value: str) -> str:
    return LENGTH_MAP.get(value, value)


def _map_model(value: str) -> str:
    return MODEL_MAP.get(value, value)


def _build_effective_prompt(payload: GenerateRequest, mapped_content_type: str, mapped_tone: str, mapped_length: str) -> str:
    if payload.prompt.strip():
        return payload.prompt.strip()

    if not payload.topic.strip():
        raise HTTPException(status_code=400, detail={"error": "topic is required when prompt is empty", "message": "topic is required when prompt is empty"})

    if not payload.targetAudience.strip():
        raise HTTPException(status_code=400, detail={"error": "targetAudience is required when prompt is empty", "message": "targetAudience is required when prompt is empty"})

    return build_prompt(
        content_type=mapped_content_type,
        tone=mapped_tone,
        audience=payload.targetAudience,
        length=mapped_length,
        keywords=payload.keywords,
        topic=payload.topic,
    )


def _get_client() -> OpenAI:
    if not Config.validate_api_key():
        raise HTTPException(status_code=500, detail={"error": "OPENROUTER_API_KEY is missing or invalid", "message": "OPENROUTER_API_KEY is missing or invalid"})

    return OpenAI(
        api_key=Config.OPENROUTER_API_KEY,
        base_url=Config.OPENROUTER_BASE_URL,
        timeout=Config.OPENROUTER_TIMEOUT,
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/generate", response_model=GenerateResponse)
def generate(payload: GenerateRequest) -> GenerateResponse:
    mapped_content_type = _map_content_type(payload.contentType)
    mapped_tone = _map_tone(payload.tone)
    mapped_length = _map_length(payload.length)
    mapped_model = _map_model(payload.model)

    prompt_text = _build_effective_prompt(payload, mapped_content_type, mapped_tone, mapped_length)

    try:
        client = _get_client()
        response = client.chat.completions.create(
            model=mapped_model,
            messages=[{"role": "user", "content": prompt_text}],
        )

        content = (response.choices[0].message.content or "").strip()
        if not content:
            raise HTTPException(status_code=500, detail={"error": "Model returned empty content", "message": "Model returned empty content"})

        return GenerateResponse(content=content)

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail={"error": str(exc), "message": str(exc)}) from exc
