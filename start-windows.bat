@echo off
echo 🚀 Starting Chat Application for Windows
echo ========================================

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo 📥 Please download and install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed

echo 📦 Setting up backend...
cd server
if not exist package.json (
    echo ❌ server/package.json not found!
    echo 📝 Please copy the server package.json content to server/package.json
    pause
    exit /b 1
)

call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo ✅ Backend dependencies installed
echo 🎯 Starting backend server...

start "Backend Server" cmd /k "npm start"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

cd ..

echo 📦 Setting up frontend...
if not exist package.json (
    echo ❌ package.json not found!
    echo 📝 Please copy the frontend package.json content to package.json
    pause
    exit /b 1
)

call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo ✅ Frontend dependencies installed
echo 🎯 Starting frontend...

npm start

echo 🎉 Chat application should now be running!
echo 🌐 Frontend: http://localhost:3000
echo 🌐 Backend: http://localhost:5000
pause
