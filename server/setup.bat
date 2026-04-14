@echo off
REM Quick Setup Script for Virtual Website Backend with OTP Auth (Windows)

echo ==================================
echo Virtual Website - Backend Setup
echo OTP Authentication Enabled
echo ==================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed. Please install it first.
    exit /b 1
)

echo OK - Node.js is installed: 
node --version

REM Check if MongoDB is running
netstat -ano | find ":27017" >nul 2>&1
if errorlevel 1 (
    echo WARNING: MongoDB is not running on localhost:27017
    echo Make sure to start MongoDB before running the server
    echo On Windows, open another terminal and run: mongod
)

echo.
echo Installing dependencies...
call npm install

if errorlevel 1 (
    echo Error: Failed to install dependencies
    exit /b 1
)

echo.
echo OK - Dependencies installed successfully!

REM Create .env if it doesn't exist
if not exist .env (
    echo.
    echo Creating .env file...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/virtual
        echo JWT_SECRET=super_secret_jwt_key
        echo JWT_REFRESH_SECRET=super_secret_refresh_key
        echo JWT_EXPIRES_IN=15m
        echo JWT_REFRESH_EXPIRES_IN=7d
        echo CLIENT_URL=http://localhost:5174
        echo NODE_ENV=development
        echo.
        echo # Supabase Configuration for OTP Authentication
        echo SUPABASE_URL=https://your-project.supabase.co
        echo SUPABASE_ANON_KEY=your-anon-key-here
    ) > .env
    echo OK - .env file created
)

echo.
echo ==================================
echo Setup Complete!
echo ==================================
echo.
echo Next Steps:
echo 1. Get Supabase credentials (Optional but recommended):
echo    - Go to https://supabase.com
echo    - Create a new project
echo    - Get API URL and Anon Key from Settings -^> API
echo    - Update .env with your credentials
echo.
echo 2. Make sure MongoDB is running (mongod)
echo.
echo 3. Start the server:
echo    npm run dev
echo.
echo 4. API will be available at: http://localhost:5000
echo    Health check: http://localhost:5000/api/health
echo.
echo Documentation: See AUTHENTICATION_SETUP.md for detailed API docs
echo.
pause
