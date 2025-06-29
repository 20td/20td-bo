#!/bin/bash

echo "🎨 Starting Chat Application Frontend..."
echo "======================================="

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

# Create package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    echo "📝 Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "chat-app-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@types/node": "^16.18.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-scripts": "5.0.1",
    "socket.io-client": "^4.7.0",
    "typescript": "^4.9.0",
    "lucide-react": "^0.263.0",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": ["react-app", "react-app/jest"]
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  },
  "proxy": "http://localhost:5000"
}
EOF
fi

# Install dependencies
echo "📦 Installing dependencies..."
echo "⏳ This may take a few minutes..."
npm install

echo ""
echo "🎯 Starting React development server..."
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔗 Make sure backend is running on: http://localhost:5000"
echo ""
echo "🛑 Press Ctrl+C to stop the development server"
echo "======================================="

# Start the React app
npm start
