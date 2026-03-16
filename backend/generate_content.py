import argparse
from dotenv import load_dotenv
from openai import OpenAI
import os
from prompt_templates import (
    CONTENT_TYPES,
    TONES,
    LENGTHS,
    build_prompt,
)


def generate_content(model, prompt):
    """
    Generates content using a specified model from OpenRouter.
    """
    try:
        load_dotenv()
        client = OpenAI(
            api_key=os.getenv("OPENROUTER_API_KEY"),
            base_url="https://openrouter.ai/api/v1",
        )

        print(f"\n========== {model} (OpenRouter) OUTPUT ==========\n")

        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
        )
        print(response.choices[0].message.content)
    except Exception as e:
        print(f"An error occurred: {e}")


def main():
    """
    Main function to parse arguments and run the content generation.
    Supports both --prompt (manual) and dynamic flags.
    """
    parser = argparse.ArgumentParser(
        description="Generate content using AI models from OpenRouter.",
    )
    parser.add_argument(
        "model",
        type=str,
        help="The model to use (e.g. 'deepseek/deepseek-chat', 'openai/gpt-oss-120b:free').",
    )

    # Manual prompt (original behaviour)
    parser.add_argument(
        "--prompt",
        type=str,
        default=None,
        help="A manual free-form prompt. If omitted, dynamic-prompt flags are used.",
    )

    # Dynamic-prompt flags
    parser.add_argument(
        "--topic",
        type=str,
        default="an innovative new product",
        help="Topic / idea to write about.",
    )
    parser.add_argument(
        "--type",
        type=str,
        default=CONTENT_TYPES[0],
        choices=CONTENT_TYPES,
        help="Content type.",
    )
    parser.add_argument(
        "--tone", type=str, default=TONES[0], choices=TONES, help="Tone / voice."
    )
    parser.add_argument(
        "--audience",
        type=str,
        default="general audience",
        help="Target audience (free text).",
    )
    parser.add_argument(
        "--length",
        type=str,
        default=LENGTHS[0][0],
        choices=[length_opt[0] for length_opt in LENGTHS],
        help="Desired length.",
    )
    parser.add_argument(
        "--keywords", type=str, default="", help="Comma-separated keywords to include."
    )

    args = parser.parse_args()

    if args.prompt:
        prompt = args.prompt
    else:
        prompt = build_prompt(
            content_type=args.type,
            tone=args.tone,
            audience=args.audience,
            length=args.length,
            keywords=args.keywords,
            topic=args.topic,
        )
        print("[Dynamic Prompt]")
        print(prompt)
        print()

    generate_content(args.model, prompt)


if __name__ == "__main__":
    main()
