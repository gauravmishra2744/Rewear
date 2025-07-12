@echo off
echo Starting ReWear Community Clothing Exchange Platform...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if MongoDB is running (optional - will use default connection)
echo Checking MongoDB connection...

REM Populate demo data if needed
echo Setting up demo data...
node demo-data.js

REM Start the application
echo.
echo Starting ReWear server...
echo Open your browser and go to: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start