@echo off
echo.
echo ********************************************************
echo *           AI Content Generator Launcher             *
echo *        Making content creation awesome!             *
echo ********************************************************
echo.

REM Check if virtual environment exists
if not exist ".venv" (
    echo [INFO] Virtual environment not found. Creating one...
    python -m venv .venv
    echo [SUCCESS] Virtual environment created!
)

REM Activate virtual environment
echo [INFO] Activating virtual environment...
call .venv\Scripts\activate.bat

REM Check if dependencies are installed
echo [INFO] Checking dependencies...
python -c "import streamlit" 2>nul
if errorlevel 1 (
    echo [INFO] Installing dependencies...
    pip install -r requirements.txt
    echo [SUCCESS] Dependencies installed!
) else (
    echo [SUCCESS] Dependencies already installed!
)

REM Check for .env file
if not exist ".env" (
    echo.
    echo [WARNING] .env file not found!
    echo Please copy .env.example to .env and add your OpenRouter API key
    echo Get your key from: https://openrouter.ai/
    echo.
    pause
    exit /b 1
)

REM Launch the application
echo.
echo [INFO] Launching AI Content Generator...
echo [INFO] The app will open in your browser shortly...
echo [INFO] Press Ctrl+C to stop the application
echo [INFO] To run API adapter separately: uvicorn api:app --host 0.0.0.0 --port 8000 --reload
echo.

streamlit run app.py --server.headless true

echo.
echo Thanks for using AI Content Generator!
pause