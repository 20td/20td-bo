"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Send, User, Crown, Users, Circle, MessageCircle } from "lucide-react"
import type { Socket } from "socket.io-client"

interface Message {
  id: string
  sender: string
  text: string
  timestamp: string
  role: "user" | "owner" | "system"
  readByOwner?: boolean
}

interface OnlineUser {
  socketId: string
  userName: string
  role: string
}

interface ChatProps {
  socket: Socket | null
  sessionId: string
  userName: string
  role: "user" | "owner"
  onMarkAsRead?: () => void
}

const Chat: React.FC<ChatProps> = ({ socket, sessionId, userName, role, onMarkAsRead }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!socket) return

    setIsConnected(socket.connected)

    // Join the session
    socket.emit("join-session", { sessionId, userName, role })

    // Socket event listeners
    const handleConnect = () => {
      setIsConnected(true)
      socket.emit("join-session", { sessionId, userName, role })
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    const handleMessageHistory = (history: Message[]) => {
      setMessages(history)
    }

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message])
    }

    const handleUserTyping = ({
      userName: typingUserName,
      isTyping: userIsTyping,
    }: { userName: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        if (userIsTyping && !prev.includes(typingUserName)) {
          return [...prev, typingUserName]
        } else if (!userIsTyping) {
          return prev.filter((name) => name !== typingUserName)
        }
        return prev
      })
    }

    const handleUsersOnline = (users: OnlineUser[]) => {
      setOnlineUsers(users)
    }

    const handleError = (error: any) => {
      console.error("Chat error:", error)
    }

    // Register event listeners
    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on("message-history", handleMessageHistory)
    socket.on("new-message", handleNewMessage)
    socket.on("user-typing", handleUserTyping)
    socket.on("users-online", handleUsersOnline)
    socket.on("error", handleError)

    // Mark messages as read when owner opens chat
    if (role === "owner" && onMarkAsRead) {
      onMarkAsRead()
      socket.emit("mark-messages-read", { sessionId })
    }

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("message-history", handleMessageHistory)
      socket.off("new-message", handleNewMessage)
      socket.off("user-typing", handleUserTyping)
      socket.off("users-online", handleUsersOnline)
      socket.off("error", handleError)
    }
  }, [socket, sessionId, userName, role, onMarkAsRead])

  useEffect(() => {
    // Simulate connection for demo
    setIsConnected(true)

    // Add some demo messages
    const demoMessages: Message[] = [
      {
        id: "1",
        sender: "System",
        text: "Welcome to the chat!",
        timestamp: new Date().toISOString(),
        role: "system",
      },
      {
        id: "2",
        sender: role === "owner" ? "User" : "Owner",
        text: "Hello! How can I help you today?",
        timestamp: new Date(Date.now() - 60000).toISOString(),
        role: role === "owner" ? "user" : "owner",
      },
    ]
    setMessages(demoMessages)
  }, [role])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!socket || !newMessage.trim() || !isConnected) return

    socket.emit("send-message", {
      sessionId,
      message: newMessage.trim(),
      sender: userName,
      role,
    })

    setNewMessage("")
    handleStopTyping()

    // Simulate response for demo
    if (role === "user") {
      setTimeout(() => {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          sender: "Support",
          text: "Thanks for your message! How can I assist you further?",
          timestamp: new Date().toISOString(),
          role: "owner",
        }
        setMessages((prev) => [...prev, response])
      }, 1000)
    }
  }

  const handleTyping = (value: string) => {
    setNewMessage(value)

    if (!socket || !isConnected) return

    if (value.trim() && !isTyping) {
      setIsTyping(true)
      socket.emit("typing-start", { sessionId, userName })
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping()
    }, 1000)
  }

  const handleStopTyping = () => {
    if (socket && isTyping && isConnected) {
      setIsTyping(false)
      socket.emit("typing-stop", { sessionId, userName })
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMessageStyle = (messageRole: string, isOwn: boolean) => {
    if (messageRole === "system") {
      return "bg-gray-100 text-gray-700 mx-auto text-center max-w-xs"
    }

    if (isOwn) {
      return messageRole === "owner" ? "bg-blue-500 text-white ml-auto" : "bg-green-500 text-white ml-auto"
    } else {
      return "bg-gray-200 text-gray-900 mr-auto"
    }
  }

  const otherOnlineUsers = onlineUsers.filter((user) => user.userName !== userName)

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Session: {sessionId.split("_")[1] || sessionId}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-sm text-gray-500">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
          </div>

          {/* Online Users */}
          {otherOnlineUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div className="flex -space-x-2">
                {otherOnlineUsers.slice(0, 3).map((user, index) => (
                  <div
                    key={user.socketId}
                    className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white"
                    title={user.userName}
                  >
                    {user.role === "owner" ? (
                      <Crown className="w-3 h-3 text-blue-600" />
                    ) : (
                      <User className="w-3 h-3 text-blue-600" />
                    )}
                  </div>
                ))}
                {otherOnlineUsers.length > 3 && (
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white text-xs font-medium text-gray-600">
                    +{otherOnlineUsers.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender === userName
            return (
              <div key={message.id} className="flex flex-col">
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getMessageStyle(message.role, isOwn)}`}>
                  {message.role !== "system" && !isOwn && (
                    <div className="flex items-center space-x-2 mb-1">
                      {message.role === "owner" ? <Crown className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      <span className="text-xs font-medium opacity-75">{message.sender}</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <div
                    className={`flex items-center justify-between mt-1 ${message.role === "system" ? "justify-center" : ""}`}
                  >
                    <p className="text-xs opacity-75">{formatTime(message.timestamp)}</p>
                    {isOwn && message.role !== "system" && (
                      <div className="flex items-center space-x-1">
                        <Circle className="w-2 h-2 fill-current opacity-75" />
                        {role === "owner" && message.readByOwner && (
                          <Circle className="w-2 h-2 fill-current opacity-75" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
            <span className="text-sm">
              {typingUsers.length === 1
                ? `${typingUsers[0]} is typing...`
                : `${typingUsers.length} people are typing...`}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onBlur={handleStopTyping}
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat
