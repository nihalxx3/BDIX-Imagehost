@echo off
REM Start FastAPI server with SSL on port 29911
uvicorn main:app --host 0.0.0.0 --port 29911
pause