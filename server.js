const express = require("express")
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

// In-memory storage
const sessions = new Map()
const connectedUsers = new Map()

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

  socket.on("join-session", ({ sessionId, userName, role = "user" }) => {
    console.log(`${userName} (${role}) joining session: ${sessionId}`)

    connectedUsers.set(socket.id, { sessionId, userName, role })
    socket.join(sessionId)

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

    socket.emit("message-history", session.messages)

    const joinMessage = {
      id: Date.now(),
      sender: "System",
      text: `${userName} joined the chat`,
      timestamp: new Date(),
      role: "system",
    }

    session.messages.push(joinMessage)
    io.to(sessionId).emit("new-message", joinMessage)

    io.emit("session-updated", {
      sessionId,
      userName: session.userName,
      isActive: true,
      lastActivity: session.lastActivity,
      unreadCount: session.messages.filter((msg) => !msg.readByOwner && msg.role !== "owner").length,
    })
  })

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

    io.to(sessionId).emit("new-message", newMessage)

    io.emit("session-updated", {
      sessionId,
      userName: session.userName,
      isActive: true,
      lastActivity: session.lastActivity,
      unreadCount: session.messages.filter((msg) => !msg.readByOwner && msg.role !== "owner").length,
      lastMessage: newMessage,
    })

    if (role !== "owner") {
      io.emit("new-message-notification", { sessionId, message: newMessage })
    }
  })

  socket.on("mark-as-read", ({ sessionId }) => {
    const session = sessions.get(sessionId)
    if (!session) return

    session.messages.forEach((msg) => {
      if (msg.role !== "owner") {
        msg.readByOwner = true
      }
    })

    io.emit("session-updated", {
      sessionId,
      userName: session.userName,
      isActive: true,
      lastActivity: session.lastActivity,
      unreadCount: 0,
    })
  })

  socket.on("typing", ({ sessionId, userName, isTyping }) => {
    socket.to(sessionId).emit("user-typing", { userName, isTyping })
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)

    const userInfo = connectedUsers.get(socket.id)
    if (userInfo) {
      const { sessionId, userName } = userInfo
      const session = sessions.get(sessionId)

      if (session) {
        session.connectedUsers.delete(socket.id)

        if (session.connectedUsers.size === 0) {
          session.isActive = false
        }

        const leaveMessage = {
          id: Date.now(),
          sender: "System",
          text: `${userName} left the chat`,
          timestamp: new Date(),
          role: "system",
        }

        session.messages.push(leaveMessage)
        socket.to(sessionId).emit("new-message", leaveMessage)

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
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 Socket.IO server ready`)
  console.log(`🌐 API available at: http://localhost:${PORT}/api/sessions`)
})
