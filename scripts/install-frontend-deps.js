const { execSync } = require("child_process")
const fs = require("fs")

console.log("🎨 Setting up React frontend...\n")

// Create frontend package.json with all required dependencies
const frontendPackageJson = {
  name: "chat-app-frontend",
  version: "0.1.0",
  private: true,
  dependencies: {
    "@types/node": "^16.18.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    react: "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-scripts": "5.0.1",
    "socket.io-client": "^4.7.0",
    typescript: "^4.9.0",
    "lucide-react": "^0.263.0",
    "web-vitals": "^2.1.4",
  },
  scripts: {
    start: "react-scripts start",
    build: "react-scripts build",
    test: "react-scripts test",
    eject: "react-scripts eject",
  },
  eslintConfig: {
    extends: ["react-app", "react-app/jest"],
  },
  browserslist: {
    production: [">0.2%", "not dead", "not op_mini all"],
    development: ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"],
  },
  proxy: "http://localhost:5000",
}

// Write package.json
fs.writeFileSync("package.json", JSON.stringify(frontendPackageJson, null, 2))

console.log("📦 Installing frontend dependencies...")
console.log("⏳ This may take a few minutes...\n")

try {
  execSync("npm install", { stdio: "inherit" })
  console.log("\n✅ Frontend dependencies installed successfully!")
  console.log("\n🎯 Starting React development server...")

  // Start the React app
  execSync("npm start", { stdio: "inherit" })
} catch (error) {
  console.error("❌ Failed to install or start frontend:", error.message)
  console.log("\n🔧 Manual setup instructions:")
  console.log("1. Run: npm install")
  console.log("2. Run: npm start")
  console.log("3. Open http://localhost:3000")
}
