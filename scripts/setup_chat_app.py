import os
import subprocess
import sys
import json
import time

def run_command(command, cwd=None, shell=True):
    """Run a command and return the result"""
    try:
        result = subprocess.run(command, cwd=cwd, shell=shell, check=True, 
                              capture_output=True, text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def check_node_npm():
    """Check if Node.js and npm are installed"""
    print("🔍 Checking Node.js and npm installation...")
    
    node_success, node_version = run_command("node --version")
    npm_success, npm_version = run_command("npm --version")
    
    if not node_success:
        print("❌ Node.js is not installed!")
        print("📥 Please download and install Node.js from: https://nodejs.org/")
        return False
    
    if not npm_success:
        print("❌ npm is not installed!")
        return False
    
    print(f"✅ Node.js {node_version.strip()} is installed")
    print(f"✅ npm {npm_version.strip()} is installed")
    return True

def setup_backend():
    """Setup the backend server"""
    print("\n🚀 Setting up backend server...")
    
    # Create server directory
    os.makedirs("server", exist_ok=True)
    
    # Create package.json for server
    server_package = {
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
    
    with open("server/package.json", "w") as f:
        json.dump(server_package, f, indent=2)
    
    print("📝 Created server/package.json")
    
    # Install server dependencies
    print("📦 Installing server dependencies...")
    success, output = run_command("npm install", cwd="server")
    
    if not success:
        print(f"❌ Failed to install server dependencies: {output}")
        return False
    
    print("✅ Server dependencies installed successfully!")
    return True

def setup_frontend():
    """Setup the frontend React app"""
    print("\n🎨 Setting up frontend React app...")
    
    # Create package.json for frontend
    frontend_package = {
        "name": "chat-app-frontend",
        "version": "0.1.0",
        "private": True,
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
    
    with open("package.json", "w") as f:
        json.dump(frontend_package, f, indent=2)
    
    print("📝 Created package.json")
    
    # Install frontend dependencies
    print("📦 Installing frontend dependencies...")
    print("⏳ This may take a few minutes...")
    
    success, output = run_command("npm install")
    
    if not success:
        print(f"❌ Failed to install frontend dependencies: {output}")
        return False
    
    print("✅ Frontend dependencies installed successfully!")
    return True

def start_backend():
    """Start the backend server"""
    print("\n🎯 Starting backend server...")
    
    if not os.path.exists("server/server.js"):
        print("❌ server/server.js not found!")
        print("📝 Please make sure all the server code files are created")
        return False
    
    print("🌐 Backend server starting on http://localhost:5000")
    print("📡 Socket.IO enabled for real-time communication")
    
    # Start server in background
    try:
        process = subprocess.Popen(["npm", "start"], cwd="server", shell=True)
        time.sleep(3)  # Give server time to start
        
        if process.poll() is None:  # Process is still running
            print("✅ Backend server started successfully!")
            return True, process
        else:
            print("❌ Backend server failed to start")
            return False, None
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return False, None

def start_frontend():
    """Start the frontend React app"""
    print("\n🎨 Starting frontend React app...")
    
    if not os.path.exists("src/App.tsx"):
        print("❌ Frontend source files not found!")
        print("📝 Please make sure all the React component files are created")
        return False
    
    print("🌐 Frontend starting on http://localhost:3000")
    print("🔗 Make sure backend is running on http://localhost:5000")
    
    try:
        subprocess.run(["npm", "start"], shell=True)
        return True
    except KeyboardInterrupt:
        print("\n🛑 Frontend server stopped")
        return True
    except Exception as e:
        print(f"❌ Error starting frontend: {e}")
        return False

def main():
    """Main setup and run function"""
    print("🚀 Chat Application Setup & Run Script")
    print("=" * 40)
    
    # Check prerequisites
    if not check_node_npm():
        sys.exit(1)
    
    # Setup backend
    if not setup_backend():
        print("❌ Backend setup failed!")
        sys.exit(1)
    
    # Setup frontend
    if not setup_frontend():
        print("❌ Frontend setup failed!")
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Make sure all source files are created (server.js, React components)")
    print("2. Run the backend: cd server && npm start")
    print("3. Run the frontend: npm start")
    print("4. Open http://localhost:3000 in your browser")
    print("5. Test with multiple browser tabs (one as owner, one as user)")
    
    # Ask if user wants to start servers
    try:
        start_now = input("\n🤔 Do you want to start the servers now? (y/n): ").lower().strip()
        
        if start_now == 'y' or start_now == 'yes':
            # Start backend
            backend_success, backend_process = start_backend()
            
            if backend_success:
                print("\n⏳ Waiting 5 seconds for backend to fully start...")
                time.sleep(5)
                
                # Start frontend
                print("🎯 Starting frontend (this will open your browser)...")
                start_frontend()
                
                # Cleanup
                if backend_process:
                    print("\n🛑 Stopping backend server...")
                    backend_process.terminate()
            else:
                print("❌ Could not start backend server")
        else:
            print("\n✅ Setup complete! You can start the servers manually.")
            
    except KeyboardInterrupt:
        print("\n🛑 Setup interrupted by user")
        sys.exit(0)

if __name__ == "__main__":
    main()
