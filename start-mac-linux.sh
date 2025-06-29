#!/bin/bash

echo "🚀 Starting Chat Application for Mac/Linux"
echo "==========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "📥 Please download and install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"

# Setup backend
echo "📦 Setting up backend..."
cd server

if [ ! -f "package.json" ]; then
    echo "❌ server/package.json not found!"
    echo "📝 Please copy the server package.json content to server/package.json"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "✅ Backend dependencies installed"
echo "🎯 Starting backend server..."

# Start backend in background
npm start &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 5

cd ..

# Setup frontend
echo "📦 Setting up frontend..."
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    echo "📝 Please copy the frontend package.json content to package.json"
    kill $BACKEND_PID
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    kill $BACKEND_PID
    exit 1
fi

echo "✅ Frontend dependencies installed"
echo "🎯 Starting frontend..."

# Start frontend
npm start

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
