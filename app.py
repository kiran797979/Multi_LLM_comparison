import os
import streamlit as st
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# OpenRouter client
client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

st.title("AI Content Generator")

st.write("Generate promotional content using different AI models.")

# Model selection
model_choice = st.selectbox(
    "Choose a Model",
    [
        "deepseek/deepseek-chat",
        "google/gemma-2-9b-it",
        "mistralai/mistral-7b-instruct"
    ]
)

# User input
prompt = st.text_area(
    "Enter your idea",
    "Write a promotional Instagram ad for an AI-powered study planner app for college students. Keep it energetic and include 3 hashtags."
)

# Generate button
if st.button("Generate Content"):
    with st.spinner("Generating..."):
        try:
            response = client.chat.completions.create(
                model=model_choice,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
            )
            output = response.choices[0].message.content
            st.success("Generated Content:")
            st.write(output)

        except Exception as e:
            st.error(f"Error: {e}")
