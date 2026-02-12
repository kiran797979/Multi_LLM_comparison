import argparse
from dotenv import load_dotenv
from openai import OpenAI
import os

def generate_content(model, prompt):
    """
    Generates content using a specified model from OpenRouter.
    """
    try:
        load_dotenv()
        client = OpenAI(
            api_key=os.getenv("OPENROUTER_API_KEY"),
            base_url="https://openrouter.ai/api/v1"
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
    """
    parser = argparse.ArgumentParser(description="Generate content using AI models from OpenRouter.")
    parser.add_argument("model", type=str, help="The model to use for content generation (e.g., 'deepseek/deepseek-chat').")
    parser.add_argument("prompt", type=str, help="The prompt to send to the model.")
    
    args = parser.parse_args()
    
    generate_content(args.model, args.prompt)

if __name__ == "__main__":
    main()