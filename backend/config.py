"""
config.py - Configuration Management for AI Content Generator

Handles environment variables and application settings.
"""

import os

from dotenv import load_dotenv
# Load environment variables
load_dotenv()


class Config:
    """Configuration class for managing settings."""

    # OpenRouter API Configuration
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_TIMEOUT: float = 60.0

    # Default Model Settings
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "deepseek/deepseek-chat")
    DEFAULT_TEMPERATURE: float = float(os.getenv("DEFAULT_TEMPERATURE", "0.7"))

    # Content Generation Settings
    MAX_RETRIES: int = 2
    RETRY_DELAY: float = 3.0

    # Available Models
    AVAILABLE_MODELS = [
        "deepseek/deepseek-chat",
        "mistralai/mistral-7b-instruct",
        "openai/gpt-oss-120b:free",
        "meta-llama/llama-3.2-90b-vision-instruct:free",
        "google/gemini-flash-1.5:free",
        "qwen/qwen-2.5-72b-instruct:free",
    ]

    # Model Fallbacks
    FALLBACK_MODELS = {
        "openai/gpt-oss-120b:free": "openai/gpt-oss-20b:free",
        "mistralai/mistral-7b-instruct": "deepseek/deepseek-chat",
    }

    # HTTP Status Codes
    NO_RETRY_CODES = {400, 404, 401, 403}  # Client errors that shouldn't be retried
    RETRY_CODES = {429, 500, 502, 503}  # Server errors that can be retried

    @classmethod
    def validate_api_key(cls) -> bool:
        """Check if API key is configured."""
        return bool(cls.OPENROUTER_API_KEY and cls.OPENROUTER_API_KEY != "your-openrouter-api-key")

    @classmethod
    def get_model_display_name(cls, model: str) -> str:
        """Get a friendly display name for a model."""
        model_names = {
            "deepseek/deepseek-chat": "DeepSeek Chat",
            "mistralai/mistral-7b-instruct": "Mistral 7B",
            "openai/gpt-oss-120b:free": "GPT OSS 120B (Free)",
            "meta-llama/llama-3.2-90b-vision-instruct:free": "LLaMA 3.2 90B (Free)",
            "google/gemini-flash-1.5:free": "Gemini Flash 1.5 (Free)",
            "qwen/qwen-2.5-72b-instruct:free": "Qwen 2.5 72B (Free)",
        }
        return model_names.get(model, model.split("/")[-1])

