"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { LogOut, Copy, Check, MessageSquare } from "lucide-react"
import Chat from "./Chat"
import { useSocket } from "../context/SocketContext"

interface UserChatProps {
  userName: string
  sessionId: string
  onLogout: () => void
}

const UserChat: React.FC<UserChatProps> = ({ userName, sessionId: initialSessionId, onLogout }) => {
  const [sessionId, setSessionId] = useState(initialSessionId)
  const [copied, setCopied] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const socket = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on("connect", () => {
      setIsConnected(true)
    })

    socket.on("disconnect", () => {
      setIsConnected(false)
    })

    socket.on("session-created", ({ sessionId: newSessionId }) => {
      setSessionId(newSessionId)
    })

    return () => {
      socket.off("connect")
      socket.off("disconnect")
      socket.off("session-created")
    }
  }, [socket])

  useEffect(() => {
    if (!sessionId && socket) {
      // Generate a new session ID if none provided
      const newSessionId = Math.random().toString(36).substring(2, 8).toUpperCase()
      setSessionId(newSessionId)
    }
  }, [sessionId, socket])

  const copySessionId = async () => {
    try {
      await navigator.clipboard.writeText(sessionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy session ID:", err)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Chat Session</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Welcome, {userName}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                  <span>{isConnected ? "Connected" : "Disconnected"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {sessionId && (
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                <span className="text-sm font-mono text-gray-700">ID: {sessionId}</span>
                <button
                  onClick={copySessionId}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Copy Session ID"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                </button>
              </div>
            )}

            <button
              onClick={onLogout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1">
        {sessionId ? (
          <Chat sessionId={sessionId} userName={userName} role="user" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Setting up your chat...</h3>
              <p className="text-gray-500">Please wait while we prepare your session</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserChat
