const { spawn } = require("child_process")
const fs = require("fs")

console.log("🎨 Starting Chat Application Frontend...")
console.log("=======================================")

// Check if package.json exists
if (!fs.existsSync("package.json")) {
  console.error("❌ package.json not found!")
  console.log("📝 Please copy the frontend package.json content to package.json")
  process.exit(1)
}

// Check if src directory exists
if (!fs.existsSync("src")) {
  console.error("❌ src directory not found!")
  console.log("📝 Please create the src folder and add all React components")
  process.exit(1)
}

console.log("✅ Frontend files found")
console.log("📦 Installing dependencies...")

// Install dependencies
const installProcess = spawn("npm", ["install"], {
  stdio: "inherit",
  shell: true,
})

installProcess.on("close", (code) => {
  if (code !== 0) {
    console.error("❌ Failed to install dependencies")
    process.exit(1)
  }

  console.log("✅ Dependencies installed successfully!")
  console.log("🎯 Starting React development server...")

  // Start the React app
  const frontendProcess = spawn("npm", ["start"], {
    stdio: "inherit",
    shell: true,
  })

  console.log("🌐 Frontend will open at http://localhost:3000")
  console.log("🔗 Make sure backend is running on http://localhost:5000")
  console.log("")
  console.log("🛑 Press Ctrl+C to stop the development server")
  console.log("=======================================")

  // Handle process termination
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down frontend...")
    frontendProcess.kill()
    process.exit(0)
  })

  process.on("SIGTERM", () => {
    console.log("\n🛑 Shutting down frontend...")
    frontendProcess.kill()
    process.exit(0)
  })
})
