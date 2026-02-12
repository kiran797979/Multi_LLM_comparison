import os
from dotenv import load_dotenv
from openai import OpenAI

# Load API key from .env
load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

prompt = """
Write a promotional Instagram ad for an AI-powered study planner app for college students.
Keep it energetic and include 3 hashtags.
"""

print("\n================= MODEL COMPARISON =================\n")


# -------------------- DeepSeek --------------------
print("========== DeepSeek Chat OUTPUT ==========\n")

try:
    response = client.chat.completions.create(
        model="deepseek/deepseek-chat",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    print(response.choices[0].message.content.strip())

except Exception as e:
    print("DeepSeek Error:", e)


print("\n--------------------------------------------------\n")


# -------------------- Gemma (Working Model) --------------------
print("========== Gemma OUTPUT ==========\n")

try:
    response = client.chat.completions.create(
        model="google/gemma-2-9b-it",   # safer working Gemma model
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    print(response.choices[0].message.content.strip())

except Exception as e:
    print("Gemma Error:", e)


print("\n--------------------------------------------------\n")


# -------------------- Mistral --------------------
print("========== Mistral 7B OUTPUT ==========\n")

try:
    response = client.chat.completions.create(
        model="mistralai/mistral-7b-instruct",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    print(response.choices[0].message.content.strip())

except Exception as e:
    print("Mistral Error:", e)


print("\n================= END OF COMPARISON =================\n")
