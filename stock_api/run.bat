@echo off
echo ====================================
echo Stock Management API - Server
echo ====================================
echo.

call venv\Scripts\activate.bat

echo Starting server on http://localhost:8000
echo.
echo API Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
