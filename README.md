# AI Content Generator

This project is an AI-powered content generator that leverages various large language models (LLMs) through the OpenRouter API. It provides two interfaces for generating content: a user-friendly web application built with Streamlit and a versatile command-line script.

## Features

-   **Multiple Model Support:** Easily switch between different LLMs available on OpenRouter, such as DeepSeek, Gemma, and more.
-   **Web Interface:** An intuitive UI built with Streamlit that allows you to select a model, enter a prompt, and view the generated content.
-   **Command-Line Interface:** A script for more advanced users who prefer to generate content from the terminal.
-   **Environment-Based Configuration:** Securely manage your API keys using a `.env` file.

## Project Structure

```
.
├── .env                  # Stores API keys and other environment variables
├── .venv/                # Virtual environment directory
├── app.py                # The main file for the Streamlit web application
├── generate_content.py   # Command-line script for content generation
├── requirements.txt      # Lists the Python dependencies for the project
└── README.md             # This file
```

## Setup

Follow these steps to set up and run the project on your local machine.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-content-generator
```

### 2. Create a Virtual Environment

It is highly recommended to use a virtual environment to manage the project's dependencies.

```bash
python -m venv .venv
```

### 3. Activate the Virtual Environment

-   **On Windows:**
    ```bash
    .venv\Scripts\activate
    ```
-   **On macOS and Linux:**
    ```bash
    source .venv/bin/activate
    ```

### 4. Install Dependencies

Install all the required Python packages using pip.

```bash
pip install -r requirements.txt
```

### 5. Set Up Environment Variables

Create a `.env` file in the root of the project and add your OpenRouter API key.

```env
OPENROUTER_API_KEY="your-openrouter-api-key"
```

## Usage

You can generate content using either the Streamlit web app or the command-line script.

### Using the Streamlit Web App

The web app provides an easy-to-use interface for content generation.

1.  **Run the app:**
    ```bash
    streamlit run app.py
    ```
2.  **Open your browser:** Navigate to the local URL provided by Streamlit (usually `http://localhost:8501`).
3.  **Select a model:** Choose from the list of available models.
4.  **Enter your prompt:** Type your content request into the text area.
5.  **Generate:** Click the "Generate Content" button to see the output.

### Using the Command-Line Script

The `generate_content.py` script is ideal for terminal-based workflows.

1.  **Run the script with arguments:**
    ```bash
    python generate_content.py "<model-id>" "<your-prompt>"
    ```
2.  **Example:**
    ```bash
    python generate_content.py "deepseek/deepseek-chat" "Write a short story about a robot who discovers music."
    ```

## Available Models

You can use any model available on OpenRouter. Here are a few examples:

-   `deepseek/deepseek-chat`
-   `google/gemma-2-9b-it`
-   `meta-llama/llama-3-8b-instruct`

For a full list of available models, please refer to the [OpenRouter documentation](https://openrouter.ai/docs).
