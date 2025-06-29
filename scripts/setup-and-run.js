const { execSync, spawn } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 Setting up Chat Application...\n")

// Create server directory and files
console.log("📁 Creating server directory...")
if (!fs.existsSync("server")) {
  fs.mkdirSync("server")
}

// Write server package.json
const serverPackageJson = {
  name: "chat-app-backend",
  version: "1.0.0",
  description: "Chat application backend with Express and Socket.IO",
  main: "server.js",
  scripts: {
    start: "node server.js",
    dev: "nodemon server.js",
  },
  dependencies: {
    express: "^4.18.2",
    "socket.io": "^4.7.0",
    cors: "^2.8.5",
  },
  devDependencies: {
    nodemon: "^3.0.0",
  },
}

fs.writeFileSync("server/package.json", JSON.stringify(serverPackageJson, null, 2))

// Write server.js
const serverCode = `const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

app.use(cors())
app.use(express.json())

// In-memory storage (replace with database in production)
const sessions = new Map() // sessionId -> { userId, userName, messages, isActive, lastActivity }
const connectedUsers = new Map() // socketId -> { sessionId, userName, role }

// API Routes
app.get("/api/sessions", (req, res) => {
  const sessionList = Array.from(sessions.entries()).map(([sessionId, session]) => ({
    sessionId,
    userName: session.userName,
    isActive: session.isActive,
    lastActivity: session.lastActivity,
    unreadCount: session.messages.filter((msg) => !msg.readByOwner && msg.role !== "owner").length,
    lastMessage: session.messages[session.messages.length - 1] || null,
  }))

  res.json(sessionList)
})

app.get("/api/sessions/:sessionId/messages", (req, res) => {
  const { sessionId } = req.params
  const session = sessions.get(sessionId)

  if (!session) {
    return res.status(404).json({ error: "Session not found" })
  }

  res.json(session.messages)
})

// Socket.IO Connection Handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // User joins a session
  socket.on("join-session", ({ sessionId, userName, role = "user" }) => {
    console.log(\`\${userName} (\${role}) joining session: \${sessionId}\`)

    // Store user connection info
    connectedUsers.set(socket.id, { sessionId, userName, role })

    // Join the socket room
    socket.join(sessionId)

    // Initialize or update session
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        userId: sessionId,
        userName: role === "owner" ? "Support Agent" : userName,
        messages: [],
        isActive: true,
        lastActivity: new Date(),
        connectedUsers: new Set(),
      })
    }

    const session = sessions.get(sessionId)
    session.connectedUsers.add(socket.id)
    session.isActive = true
    session.lastActivity = new Date()

    // Send existing messages to the user
    socket.emit("message-history", session.messages)

    // Notify about user joining
    const joinMessage = {
      id: Date.now(),
      sender: "System",
      text: \`\${userName} joined the chat\`,
      timestamp: new Date(),
      role: "system",
    }

    session.messages.push(joinMessage)
    io.to(sessionId).emit("new-message", joinMessage)

    // Notify owner dashboard about session update
    io.emit("session-updated", {
      sessionId,
      userName: session.userName,
      isActive: true,
      lastActivity: session.lastActivity,
      unreadCount: session.messages.filter((msg) => !msg.readByOwner && msg.role !== "owner").length,
    })
  })

  // Handle sending messages
  socket.on("send-message", ({ sessionId, message, sender, role }) => {
    const session = sessions.get(sessionId)
    if (!session) return

    const newMessage = {
      id: Date.now(),
      sender,
      text: message,
      timestamp: new Date(),
      role: role || "user",
      readByOwner: role === "owner",
    }

    session.messages.push(newMessage)
    session.lastActivity = new Date()

    // Send message to all users in the session
    io.to(sessionId).emit("new-message", newMessage)

    // Update owner dashboard
    io.emit("session-updated", {
      sessionId,
      userName: session.userName,
      isActive: true,
      lastActivity: session.lastActivity,
      unreadCount: session.messages.filter((msg) => !msg.readByOwner && msg.role !== "owner").length,
      lastMessage: newMessage,
    })

    // Send notification sound trigger
    if (role !== "owner") {
      io.emit("new-message-notification", { sessionId, message: newMessage })
    }
  })

  // Mark messages as read by owner
  socket.on("mark-as-read", ({ sessionId }) => {
    const session = sessions.get(sessionId)
    if (!session) return

    session.messages.forEach((msg) => {
      if (msg.role !== "owner") {
        msg.readByOwner = true
      }
    })

    // Update owner dashboard
    io.emit("session-updated", {
      sessionId,
      userName: session.userName,
      isActive: true,
      lastActivity: session.lastActivity,
      unreadCount: 0,
    })
  })

  // Handle user typing
  socket.on("typing", ({ sessionId, userName, isTyping }) => {
    socket.to(sessionId).emit("user-typing", { userName, isTyping })
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)

    const userInfo = connectedUsers.get(socket.id)
    if (userInfo) {
      const { sessionId, userName } = userInfo
      const session = sessions.get(sessionId)

      if (session) {
        session.connectedUsers.delete(socket.id)

        // If no users left in session, mark as inactive
        if (session.connectedUsers.size === 0) {
          session.isActive = false
        }

        // Notify about user leaving
        const leaveMessage = {
          id: Date.now(),
          sender: "System",
          text: \`\${userName} left the chat\`,
          timestamp: new Date(),
          role: "system",
        }

        session.messages.push(leaveMessage)
        socket.to(sessionId).emit("new-message", leaveMessage)

        // Update owner dashboard
        io.emit("session-updated", {
          sessionId,
          userName: session.userName,
          isActive: session.isActive,
          lastActivity: session.lastActivity,
          unreadCount: session.messages.filter((msg) => !msg.readByOwner && msg.role !== "owner").length,
        })
      }

      connectedUsers.delete(socket.id)
    }
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`)
  console.log(\`📡 Socket.IO server ready for connections\`)
})`

fs.writeFileSync("server/server.js", serverCode)

console.log("📦 Installing server dependencies...")
try {
  execSync("npm install", { cwd: "server", stdio: "inherit" })
  console.log("✅ Server dependencies installed successfully!\n")
} catch (error) {
  console.error("❌ Failed to install server dependencies:", error.message)
  process.exit(1)
}

console.log("🎯 Starting backend server...")
const serverProcess = spawn("npm", ["start"], {
  cwd: "server",
  stdio: "inherit",
  shell: true,
})

// Give server time to start
setTimeout(() => {
  console.log("\n🌐 Backend server should be running on http://localhost:5000")
  console.log("📝 You can test the API at: http://localhost:5000/api/sessions")
  console.log("\n🎉 Chat application backend is ready!")
  console.log("\n📋 Next steps:")
  console.log("1. Open a new terminal")
  console.log("2. Run the frontend with: npm start")
  console.log("3. Open http://localhost:3000 in your browser")
  console.log("4. Test with multiple browser tabs (one as owner, one as user)")
}, 2000)

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...")
  serverProcess.kill()
  process.exit(0)
})
