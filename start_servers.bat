@echo off
echo ========================================================
echo Starting all Microservices for PICT_PROJECT_2...
echo ========================================================

echo Launching Node.js Backend...
start "Node Backend" cmd /k "cd server && npm run dev"

echo Launching React Frontend...
start "React Frontend" cmd /k "cd client && npm run dev"

echo Launching FastAPI AI Backend...
start "FastAPI AI Backend" cmd /k "cd ai-backend && if not exist venv (python -m venv venv) && call venv\Scripts\activate && if not exist venv\Scripts\uvicorn.exe (echo Installing dependencies... && pip install -r requirements.txt) && uvicorn main:app --reload"

echo ========================================================
echo All servers have been launched in separate terminal windows!
echo ========================================================
