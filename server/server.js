const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")

const app = express()
const server = http.createServer(app)

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
})

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())

// In-memory storage for demo
const sessions = new Map()
const messages = new Map()
const users = new Map()

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // Join session
  socket.on("join-session", ({ sessionId, userName, role }) => {
    console.log(`${userName} (${role}) joined session: ${sessionId}`)

    socket.join(sessionId)
    socket.sessionId = sessionId
    socket.userName = userName
    socket.role = role

    // Store user info
    users.set(socket.id, { userName, role, sessionId })

    // Initialize session if it doesn't exist
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        sessionId,
        userName: role === "user" ? userName : "Multiple Users",
        isActive: true,
        lastActivity: new Date().toISOString(),
        unreadCount: 0,
        messageCount: 0,
        users: [],
      })
      messages.set(sessionId, [])
    }

    // Update session
    const session = sessions.get(sessionId)
    if (!session.users.includes(userName)) {
      session.users.push(userName)
    }
    session.isActive = true
    session.lastActivity = new Date().toISOString()

    // Send message history
    const sessionMessages = messages.get(sessionId) || []
    socket.emit("message-history", sessionMessages)

    // Notify others in session
    socket.to(sessionId).emit("user-joined", { userName, role })

    // Update session for owners
    io.emit("session-updated", session)
  })

  // Send message
  socket.on("send-message", ({ sessionId, message, sender, role }) => {
    const messageObj = {
      id: Date.now().toString(),
      sender,
      text: message,
      timestamp: new Date().toISOString(),
      role,
      readByOwner: role === "owner",
    }

    // Store message
    if (!messages.has(sessionId)) {
      messages.set(sessionId, [])
    }
    messages.get(sessionId).push(messageObj)

    // Update session
    if (sessions.has(sessionId)) {
      const session = sessions.get(sessionId)
      session.messageCount++
      session.lastActivity = new Date().toISOString()
      session.lastMessage = {
        sender,
        text: message,
        timestamp: messageObj.timestamp,
        role,
      }

      if (role === "user") {
        session.unreadCount++
      }

      sessions.set(sessionId, session)
      io.emit("session-updated", session)
    }

    // Send message to all users in session
    io.to(sessionId).emit("new-message", messageObj)

    // Notify owners of new message
    if (role === "user") {
      socket.broadcast.emit("new-message-notification", {
        sessionId,
        message: messageObj,
        sessionData: sessions.get(sessionId),
      })
    }
  })

  // Typing indicators
  socket.on("typing-start", ({ sessionId, userName }) => {
    socket.to(sessionId).emit("user-typing", { userName, isTyping: true })
  })

  socket.on("typing-stop", ({ sessionId, userName }) => {
    socket.to(sessionId).emit("user-typing", { userName, isTyping: false })
  })

  // Mark messages as read
  socket.on("mark-messages-read", ({ sessionId }) => {
    if (sessions.has(sessionId)) {
      const session = sessions.get(sessionId)
      session.unreadCount = 0
      sessions.set(sessionId, session)
      io.emit("session-updated", session)
    }
  })

  // Get sessions (for owner dashboard)
  socket.on("get-sessions", () => {
    const sessionsList = Array.from(sessions.values())
    socket.emit("sessions-list", sessionsList)
  })

  // Owner join all sessions
  socket.on("owner-join-all-sessions", () => {
    sessions.forEach((session) => {
      socket.join(session.sessionId)
    })
  })

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)

    const user = users.get(socket.id)
    if (user && user.sessionId) {
      // Update session
      if (sessions.has(user.sessionId)) {
        const session = sessions.get(user.sessionId)
        session.users = session.users.filter((u) => u !== user.userName)
        session.isActive = session.users.length > 0
        session.lastActivity = new Date().toISOString()
        sessions.set(user.sessionId, session)

        // Notify others
        socket.to(user.sessionId).emit("user-left", { userName: user.userName })
        io.emit("session-updated", session)
      }
    }

    users.delete(socket.id)
  })
})

// REST API endpoints
app.get("/api/sessions", (req, res) => {
  const sessionsList = Array.from(sessions.values())
  res.json(sessionsList)
})

app.get("/api/sessions/:sessionId/messages", (req, res) => {
  const { sessionId } = req.params
  const sessionMessages = messages.get(sessionId) || []
  res.json(sessionMessages)
})

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`🚀 Chat server running on port ${PORT}`)
  console.log(`📡 Socket.IO server ready for connections`)
  console.log(`🌐 CORS enabled for: ${process.env.CLIENT_URL || "http://localhost:3000"}`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("Process terminated")
  })
})
