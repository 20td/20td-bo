const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")
const cors = require("cors")

const app = express()
const httpServer = createServer(app)

// Socket.IO Server with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
})

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())

// In-memory storage for sessions and users
const sessions = new Map()
const messages = new Map()

// Utility functions
const generateSessionId = () => Math.random().toString(36).substring(2, 8).toUpperCase()

const getOrCreateSession = (sessionId) => {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      id: sessionId,
      users: [],
      messageCount: 0,
      lastActivity: new Date().toISOString(),
      unreadCount: 0,
    })
    messages.set(sessionId, [])
  }
  return sessions.get(sessionId)
}

const updateSessionActivity = (sessionId) => {
  const session = sessions.get(sessionId)
  if (session) {
    session.lastActivity = new Date().toISOString()
    sessions.set(sessionId, session)
  }
}

// Socket.IO Event Handlers
io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`)

  // Handle user joining a session
  socket.on("join-session", ({ sessionId, userName, role = "user" }) => {
    console.log(`👤 ${userName} (${role}) joining session: ${sessionId}`)

    // Create session if it doesn't exist
    const session = getOrCreateSession(sessionId)

    // Add user to session if not already present
    if (!session.users.includes(userName)) {
      session.users.push(userName)
    }

    // Join the socket room
    socket.join(sessionId)
    socket.sessionId = sessionId
    socket.userName = userName
    socket.role = role

    // Update session activity
    updateSessionActivity(sessionId)

    // Send message history to the user
    const sessionMessages = messages.get(sessionId) || []
    socket.emit("message-history", sessionMessages)

    // Notify others in the session
    socket.to(sessionId).emit("user-joined", { userName, role })

    // Send updated session info to owners
    io.emit("session-updated", session)

    // Send system message
    const systemMessage = {
      id: Date.now(),
      sender: "System",
      text: `${userName} joined the chat`,
      timestamp: new Date().toISOString(),
      role: "system",
    }

    const sessionMessagesList = messages.get(sessionId)
    sessionMessagesList.push(systemMessage)
    messages.set(sessionId, sessionMessagesList)

    io.to(sessionId).emit("new-message", systemMessage)
  })

  // Handle sending messages
  socket.on("send-message", ({ sessionId, message, sender, role = "user" }) => {
    console.log(`💬 Message from ${sender} in session ${sessionId}: ${message}`)

    const newMessage = {
      id: Date.now(),
      sender,
      text: message,
      timestamp: new Date().toISOString(),
      role,
      readByOwner: role === "owner",
    }

    // Store message
    const sessionMessages = messages.get(sessionId) || []
    sessionMessages.push(newMessage)
    messages.set(sessionId, sessionMessages)

    // Update session
    const session = sessions.get(sessionId)
    if (session) {
      session.messageCount++
      if (role === "user") {
        session.unreadCount++
      }
      updateSessionActivity(sessionId)
      sessions.set(sessionId, session)

      // Notify owners of session update
      io.emit("session-updated", session)
    }

    // Broadcast message to all users in the session
    io.to(sessionId).emit("new-message", newMessage)
  })

  // Handle typing indicators
  socket.on("typing", ({ sessionId, userName, isTyping }) => {
    socket.to(sessionId).emit("user-typing", { userName, isTyping })
  })

  // Get all sessions (for owner dashboard)
  socket.on("get-sessions", () => {
    const sessionsList = Array.from(sessions.values())
    socket.emit("sessions-list", sessionsList)
  })

  // Mark messages as read
  socket.on("mark-as-read", ({ sessionId }) => {
    const session = sessions.get(sessionId)
    if (session) {
      session.unreadCount = 0
      sessions.set(sessionId, session)
      io.emit("session-updated", session)
    }
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`🔌 User disconnected: ${socket.id}`)

    if (socket.sessionId && socket.userName) {
      const session = sessions.get(socket.sessionId)
      if (session) {
        // Remove user from session
        session.users = session.users.filter((user) => user !== socket.userName)
        sessions.set(socket.sessionId, session)

        // Notify others in the session
        socket.to(socket.sessionId).emit("user-left", {
          userName: socket.userName,
          role: socket.role,
        })

        // Send system message
        const systemMessage = {
          id: Date.now(),
          sender: "System",
          text: `${socket.userName} left the chat`,
          timestamp: new Date().toISOString(),
          role: "system",
        }

        const sessionMessages = messages.get(socket.sessionId) || []
        sessionMessages.push(systemMessage)
        messages.set(socket.sessionId, sessionMessages)

        socket.to(socket.sessionId).emit("new-message", systemMessage)

        // Update session info for owners
        io.emit("session-updated", session)
      }
    }
  })
})

// REST API Endpoints
app.get("/api/sessions", (req, res) => {
  const sessionsList = Array.from(sessions.values())
  res.json(sessionsList)
})

app.get("/api/sessions/:sessionId/messages", (req, res) => {
  const { sessionId } = req.params
  const sessionMessages = messages.get(sessionId) || []
  res.json(sessionMessages)
})

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    sessions: sessions.size,
    totalMessages: Array.from(messages.values()).reduce((sum, msgs) => sum + msgs.length, 0),
  })
})

// Error handling for the server
httpServer.on("error", (error) => {
  console.error("❌ Server error:", error)
})

// Start the server
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`🚀 Chat server running on port ${PORT}`)
  console.log(`📡 Socket.IO server ready for connections`)
  console.log(`🌐 Health check available at http://localhost:${PORT}/health`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully")
  httpServer.close(() => {
    console.log("✅ Server closed")
    process.exit(0)
  })
})

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully")
  httpServer.close(() => {
    console.log("✅ Server closed")
    process.exit(0)
  })
})
