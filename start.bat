@echo off
REM Virtual Platform - Quick Start Script (Windows)
REM This script helps you set up and run the Virtual Platform

echo.
echo =====================================
echo Virtual Platform - Quick Start
echo =====================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [✓] Node.js is installed
echo.

REM Check if MongoDB is accessible
echo Checking MongoDB connection...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] MongoDB command-line tools not found
    echo You can still use MongoDB Atlas (cloud) instead of local MongoDB
    echo If using local MongoDB, make sure mongod is running in another terminal
    echo.
) else (
    echo [✓] MongoDB is installed
)

echo.
echo =====================================
echo Installation Steps
echo =====================================
echo.

REM Navigate to backend folder
cd backend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing NPM dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: npm install failed!
        cd ..
        pause
        exit /b 1
    )
    echo [✓] Dependencies installed successfully
) else (
    echo [✓] Dependencies already installed
)

echo.
echo =====================================
echo Configuration
echo =====================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file...
    (
        echo # Virtual Platform Configuration
        echo PORT=5000
        echo NODE_ENV=development
        echo.
        echo # MongoDB - Choose one:
        echo # For local: mongodb://localhost:27017/virtual-platform
        echo # For Atlas: mongodb+srv://username:password@cluster.mongodb.net/virtual-platform
        echo MONGODB_URI=mongodb://localhost:27017/virtual-platform
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=your-super-secret-jwt-key-change-this
        echo JWT_EXPIRE=7d
        echo.
        echo # Password Hashing
        echo BCRYPT_ROUNDS=10
    ) > .env
    echo [✓] .env file created
    echo.
    echo IMPORTANT: Edit the .env file with your MongoDB connection string!
    echo.
) else (
    echo [✓] .env file already exists
)

echo.
echo =====================================
echo Starting Virtual Platform
echo =====================================
echo.

echo To run the application:
echo.
echo Option 1 - Production Mode:
echo   npm start
echo.
echo Option 2 - Development Mode (with auto-reload):
echo   npm run dev
echo.

REM Prompt user if they want to start now
set /p startNow="Would you like to start the server now? (y/n): "

if /i "%startNow%"=="y" (
    echo.
    echo Starting server...
    echo Remember: MongoDB must be running!
    echo.
    timeout /t 2
    
    call npm start
) else (
    echo.
    echo Setup complete!
    echo.
    echo To start the server later:
    echo   cd backend
    echo   npm start
    echo.
    echo Then open: http://localhost:5000
    echo.
    cd ..
)
