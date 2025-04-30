@echo off

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is required but not installed. Please install Python.
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is required but not installed. Please install Node.js.
    exit /b 1
)

:: Create and activate virtual environment
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

:: Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

:: Initialize database
echo Initializing database...
python init_db.py

:: Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

:: Start the application
echo Starting the application...
echo Open http://localhost:3000 in your browser once both servers are running.

:: Start backend in background
start /B python app.py

:: Start frontend
cd frontend
call npm start 