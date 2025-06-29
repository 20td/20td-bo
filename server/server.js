const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")
const cors = require("cors")

const app = express()
const httpServer = createServer(app)

// Socket.IO Server with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
})

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())

// In-memory storage for sessions and users
const chatSessions = new Map()
const connectedUsers = new Map()
const ownerSockets = new Set()

// Utility functions
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

const createMessage = (sender, text, role = "user") => ({
  id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  sender,
  text,
  timestamp: new Date().toISOString(),
  role,
  readByOwner: role === "owner",
})

const getSessionData = (sessionId) => {
  const session = chatSessions.get(sessionId)
  if (!session) return null

  return {
    sessionId,
    userName: session.userName,
    isActive: session.connectedUsers.size > 0,
    lastActivity: session.lastActivity,
    unreadCount: session.messages.filter((msg) => !msg.readByOwner && msg.role !== "owner").length,
    lastMessage: session.messages[session.messages.length - 1] || null,
    messageCount: session.messages.length,
  }
}

// REST API Endpoints
app.get("/api/sessions", (req, res) => {
  const sessions = Array.from(chatSessions.keys())
    .map((sessionId) => getSessionData(sessionId))
    .filter(Boolean)
  res.json(sessions)
})

app.get("/api/sessions/:sessionId", (req, res) => {
  const sessionData = getSessionData(req.params.sessionId)
  if (!sessionData) {
    return res.status(404).json({ error: "Session not found" })
  }
  res.json(sessionData)
})

app.get("/api/sessions/:sessionId/messages", (req, res) => {
  const session = chatSessions.get(req.params.sessionId)
  if (!session) {
    return res.status(404).json({ error: "Session not found" })
  }
  res.json(session.messages)
})

// Socket.IO Event Handlers
io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`)

  // Handle user joining a session
  socket.on("join-session", ({ sessionId, userName, role = "user" }) => {
    console.log(`👤 ${userName} (${role}) joining session: ${sessionId}`)

    // Store user info
    connectedUsers.set(socket.id, { sessionId, userName, role })

    // Track owner sockets
    if (role === "owner") {
      ownerSockets.add(socket.id)
    }

    // Join the socket room
    socket.join(sessionId)

    // Initialize session if it doesn't exist
    if (!chatSessions.has(sessionId)) {
      chatSessions.set(sessionId, {
        sessionId,
        userName: role === "owner" ? "Support Team" : userName,
        messages: [],
        connectedUsers: new Set(),
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })
    }

    const session = chatSessions.get(sessionId)
    session.connectedUsers.add(socket.id)
    session.lastActivity = new Date().toISOString()

    // Send message history to the joining user
    socket.emit("message-history", session.messages)

    // Create and broadcast join message
    const joinMessage = createMessage("System", `${userName} joined the chat`, "system")
    session.messages.push(joinMessage)

    io.to(sessionId).emit("new-message", joinMessage)

    // Notify all owners about session update
    const sessionData = getSessionData(sessionId)
    ownerSockets.forEach((ownerSocketId) => {
      io.to(ownerSocketId).emit("session-updated", sessionData)
    })

    // Send current online users in session
    const onlineUsers = Array.from(session.connectedUsers)
      .map((socketId) => {
        const user = connectedUsers.get(socketId)
        return user ? { socketId, userName: user.userName, role: user.role } : null
      })
      .filter(Boolean)

    io.to(sessionId).emit("users-online", onlineUsers)

    console.log(`✅ ${userName} successfully joined session ${sessionId}`)
  })

  // Handle sending messages
  socket.on("send-message", ({ sessionId, message, sender, role = "user" }) => {
    const session = chatSessions.get(sessionId)
    if (!session) {
      socket.emit("error", { message: "Session not found" })
      return
    }

    // Create new message
    const newMessage = createMessage(sender, message, role)
    session.messages.push(newMessage)
    session.lastActivity = new Date().toISOString()

    // Broadcast message to all users in the session
    io.to(sessionId).emit("new-message", newMessage)

    // Update session data for owners
    const sessionData = getSessionData(sessionId)
    ownerSockets.forEach((ownerSocketId) => {
      io.to(ownerSocketId).emit("session-updated", sessionData)
    })

    // Send notification to owners if message is from user
    if (role !== "owner") {
      ownerSockets.forEach((ownerSocketId) => {
        io.to(ownerSocketId).emit("new-message-notification", {
          sessionId,
          message: newMessage,
          sessionData,
        })
      })
    }

    console.log(`💬 Message sent in ${sessionId} by ${sender}: ${message}`)
  })

  // Handle typing indicators
  socket.on("typing-start", ({ sessionId, userName }) => {
    socket.to(sessionId).emit("user-typing", { userName, isTyping: true })
  })

  socket.on("typing-stop", ({ sessionId, userName }) => {
    socket.to(sessionId).emit("user-typing", { userName, isTyping: false })
  })

  // Handle marking messages as read by owner
  socket.on("mark-messages-read", ({ sessionId }) => {
    const session = chatSessions.get(sessionId)
    if (!session) return

    // Mark all non-owner messages as read
    session.messages.forEach((msg) => {
      if (msg.role !== "owner") {
        msg.readByOwner = true
      }
    })

    // Update session data for all owners
    const sessionData = getSessionData(sessionId)
    ownerSockets.forEach((ownerSocketId) => {
      io.to(ownerSocketId).emit("session-updated", sessionData)
    })

    console.log(`📖 Messages marked as read in session ${sessionId}`)
  })

  // Handle owner joining all sessions (for dashboard)
  socket.on("owner-join-all-sessions", () => {
    const userInfo = connectedUsers.get(socket.id)
    if (userInfo && userInfo.role === "owner") {
      // Join all existing sessions
      chatSessions.forEach((session, sessionId) => {
        socket.join(sessionId)
      })

      // Send all sessions data
      const allSessions = Array.from(chatSessions.keys())
        .map((sessionId) => getSessionData(sessionId))
        .filter(Boolean)
      socket.emit("all-sessions", allSessions)

      console.log(`👑 Owner ${userInfo.userName} joined all sessions`)
    }
  })

  // Handle getting session list
  socket.on("get-sessions", () => {
    const sessions = Array.from(chatSessions.keys())
      .map((sessionId) => getSessionData(sessionId))
      .filter(Boolean)
    socket.emit("sessions-list", sessions)
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`🔌 User disconnected: ${socket.id}`)

    const userInfo = connectedUsers.get(socket.id)
    if (userInfo) {
      const { sessionId, userName, role } = userInfo
      const session = chatSessions.get(sessionId)

      if (session) {
        // Remove user from session
        session.connectedUsers.delete(socket.id)

        // Create leave message
        const leaveMessage = createMessage("System", `${userName} left the chat`, "system")
        session.messages.push(leaveMessage)
        session.lastActivity = new Date().toISOString()

        // Broadcast leave message
        socket.to(sessionId).emit("new-message", leaveMessage)

        // Update online users
        const onlineUsers = Array.from(session.connectedUsers)
          .map((socketId) => {
            const user = connectedUsers.get(socketId)
            return user ? { socketId, userName: user.userName, role: user.role } : null
          })
          .filter(Boolean)

        io.to(sessionId).emit("users-online", onlineUsers)

        // Update session data for owners
        const sessionData = getSessionData(sessionId)
        ownerSockets.forEach((ownerSocketId) => {
          io.to(ownerSocketId).emit("session-updated", sessionData)
        })
      }

      // Remove from tracking
      connectedUsers.delete(socket.id)
      if (role === "owner") {
        ownerSockets.delete(socket.id)
      }

      console.log(`👋 ${userName} (${role}) left session ${sessionId}`)
    }
  })

  // Handle errors
  socket.on("error", (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error)
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
  console.log(`🌐 API endpoints available at http://localhost:${PORT}/api`)
  console.log(`🔗 Frontend should connect to http://localhost:${PORT}`)
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
