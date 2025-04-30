#!/bin/bash

# Check Python version
PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
MIN_VERSION="3.9"
MAX_VERSION="3.13"

# Basic version check
if [[ "$PYTHON_VERSION" == "3.12" ]] || [[ "$PYTHON_VERSION" == "3.9" ]]; then
    echo "Python version $PYTHON_VERSION is supported"
else
    echo "Error: Python version must be between $MIN_VERSION and $MAX_VERSION (inclusive)"
    echo "Current Python version: $PYTHON_VERSION"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required but not installed. Please install Python 3."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is required but not installed. Please install Node.js."
    exit 1
fi

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p uploads
mkdir -p frontend/node_modules

# Create and activate virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
# Upgrade pip first
python3 -m pip install --upgrade pip
# Install wheel
pip install wheel
# Install dependencies
pip install -r requirements.txt

# Check if all dependencies are installed
if ! python3 -c "import flask, pandas" &> /dev/null; then
    echo "Failed to install required Python packages. Please check the error messages above."
    exit 1
fi

# Initialize database
echo "Initializing database..."
python init_db.py

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Start the application
echo "Starting the application..."
echo "Open http://localhost:3000 in your browser once both servers are running."

# Start backend in a new terminal window
echo "Starting backend server..."
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && source venv/bin/activate && python app.py"'

# Start frontend in a new terminal window
echo "Starting frontend server..."
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"'/frontend && npm start"'

echo "Both servers have been started in separate terminal windows."
echo "You can monitor their output in the respective terminal windows."
echo "Press Ctrl+C in each terminal window to stop the respective server." 