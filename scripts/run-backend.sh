#!/bin/bash

echo "🚀 Starting Chat Application Backend..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "📥 Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Create server directory if it doesn't exist
mkdir -p server

# Navigate to server directory
cd server

# Create package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    echo "📝 Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "chat-app-backend",
  "version": "1.0.0",
  "description": "Chat application backend with Express and Socket.IO",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
EOF
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if server.js exists
if [ ! -f "server.js" ]; then
    echo "❌ server.js not found. Please make sure the server code is in server/server.js"
    exit 1
fi

echo "🎯 Starting server on port 5000..."
echo "📡 Socket.IO enabled for real-time communication"
echo "🌐 API available at: http://localhost:5000/api/sessions"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo "=================================="

# Start the server
npm start
