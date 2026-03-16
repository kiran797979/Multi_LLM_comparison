import os
from dotenv import load_dotenv
from openai import OpenAI
from prompt_templates import build_prompt

# Load API key from .env
load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"), base_url="https://openrouter.ai/api/v1"
)

# ── Dynamic prompt using the new build_prompt function ───────────
prompt = build_prompt(
    content_type="LinkedIn Post",
    tone="Professional",
    audience="college students",
    length="Short",
    keywords="AI, productivity",
    topic="AI-powered study planner app for college students",
)

print("[Dynamic Prompt]")
print(prompt)

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


# -------------------- GPT-OSS-120B --------------------
print("========== GPT-OSS-120B OUTPUT ==========\n")

try:
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b:free",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    print(response.choices[0].message.content.strip())

except Exception as e:
    print("GPT-OSS-120B Error:", e)


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
