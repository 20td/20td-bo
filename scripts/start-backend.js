const { spawn } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 Starting Chat Application Backend...")
console.log("=====================================")

// Check if server directory exists
if (!fs.existsSync("server")) {
  console.error("❌ Server directory not found!")
  console.log("📝 Please make sure you have:")
  console.log('   1. Created a "server" folder')
  console.log("   2. Added server.js and package.json files")
  process.exit(1)
}

// Check if server.js exists
if (!fs.existsSync("server/server.js")) {
  console.error("❌ server/server.js not found!")
  console.log("📝 Please copy the server.js content to server/server.js")
  process.exit(1)
}

// Check if package.json exists
if (!fs.existsSync("server/package.json")) {
  console.error("❌ server/package.json not found!")
  console.log("📝 Please copy the server package.json content to server/package.json")
  process.exit(1)
}

console.log("✅ Server files found")
console.log("📦 Installing dependencies...")

// Install dependencies
const installProcess = spawn("npm", ["install"], {
  cwd: "server",
  stdio: "inherit",
  shell: true,
})

installProcess.on("close", (code) => {
  if (code !== 0) {
    console.error("❌ Failed to install dependencies")
    process.exit(1)
  }

  console.log("✅ Dependencies installed successfully!")
  console.log("🎯 Starting Socket.IO server...")

  // Start the server
  const serverProcess = spawn("npm", ["start"], {
    cwd: "server",
    stdio: "inherit",
    shell: true,
  })

  console.log("🌐 Backend server starting on http://localhost:5000")
  console.log("📡 Socket.IO enabled for real-time communication")
  console.log("🔗 API endpoints available at /api/sessions")
  console.log("")
  console.log("🛑 Press Ctrl+C to stop the server")
  console.log("=====================================")

  // Handle process termination
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down server...")
    serverProcess.kill()
    process.exit(0)
  })

  process.on("SIGTERM", () => {
    console.log("\n🛑 Shutting down server...")
    serverProcess.kill()
    process.exit(0)
  })
})
