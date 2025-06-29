"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Send, User, Crown } from "lucide-react"
import { useSocket } from "../context/SocketContext"

interface Message {
  id: number
  sender: string
  text: string
  timestamp: string
  role: "user" | "owner" | "system"
  readByOwner?: boolean
}

interface ChatProps {
  sessionId: string
  userName: string
  role: "user" | "owner"
  onMarkAsRead?: () => void
}

const Chat: React.FC<ChatProps> = ({ sessionId, userName, role, onMarkAsRead }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const socket = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.emit("join-session", { sessionId, userName, role })

    socket.on("message-history", (history: Message[]) => {
      setMessages(history)
    })

    socket.on("new-message", (message: Message) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on("user-typing", ({ userName: typingUserName, isTyping: userIsTyping }) => {
      if (userIsTyping) {
        setTypingUser(typingUserName)
      } else {
        setTypingUser(null)
      }
    })

    if (role === "owner" && onMarkAsRead) {
      onMarkAsRead()
    }

    return () => {
      socket.off("message-history")
      socket.off("new-message")
      socket.off("user-typing")
    }
  }, [socket, sessionId, userName, role, onMarkAsRead])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!socket || !newMessage.trim()) return

    socket.emit("send-message", {
      sessionId,
      message: newMessage.trim(),
      sender: userName,
      role,
    })

    setNewMessage("")
    socket.emit("typing", { sessionId, userName, isTyping: false })
    setIsTyping(false)
  }

  const handleTyping = (value: string) => {
    setNewMessage(value)

    if (!socket) return

    if (value.trim() && !isTyping) {
      setIsTyping(true)
      socket.emit("typing", { sessionId, userName, isTyping: true })
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      socket.emit("typing", { sessionId, userName, isTyping: false })
    }, 1000)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getMessageStyle = (messageRole: string) => {
    switch (messageRole) {
      case "owner":
        return "bg-blue-500 text-white ml-auto"
      case "user":
        return "bg-gray-200 text-gray-900 mr-auto"
      case "system":
        return "bg-yellow-100 text-yellow-800 mx-auto text-center"
      default:
        return "bg-gray-200 text-gray-900 mr-auto"
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getMessageStyle(message.role)}`}>
              {message.role !== "system" && (
                <div className="flex items-center space-x-2 mb-1">
                  {message.role === "owner" ? <Crown className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <span className="text-xs font-medium opacity-75">{message.sender}</span>
                </div>
              )}
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 opacity-75 ${message.role === "system" ? "text-center" : ""}`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {typingUser && typingUser !== userName && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
            <span className="text-sm">{typingUser} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat
