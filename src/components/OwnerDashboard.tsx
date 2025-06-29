"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { LogOut, Search, Users, MessageSquare, Clock, Bell } from "lucide-react"
import Chat from "./Chat"
import { useSocket } from "../context/SocketContext"

interface Session {
  id: string
  users: string[]
  messageCount: number
  lastActivity: string
  unreadCount: number
}

interface OwnerDashboardProps {
  userName: string
  onLogout: () => void
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ userName, onLogout }) => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "unread">("all")
  const socket = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.emit("get-sessions")

    socket.on("sessions-list", (sessionsList: Session[]) => {
      setSessions(sessionsList)
    })

    socket.on("session-updated", (updatedSession: Session) => {
      setSessions((prev) => prev.map((session) => (session.id === updatedSession.id ? updatedSession : session)))
    })

    socket.on("new-session", (newSession: Session) => {
      setSessions((prev) => [...prev, newSession])
    })

    return () => {
      socket.off("sessions-list")
      socket.off("session-updated")
      socket.off("new-session")
    }
  }, [socket])

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.users.some((user) => user.toLowerCase().includes(searchTerm.toLowerCase()))

    switch (filter) {
      case "active":
        return matchesSearch && session.users.length > 0
      case "unread":
        return matchesSearch && session.unreadCount > 0
      default:
        return matchesSearch
    }
  })

  const handleMarkAsRead = (sessionId: string) => {
    setSessions((prev) => prev.map((session) => (session.id === sessionId ? { ...session, unreadCount: 0 } : session)))
  }

  const totalUnread = sessions.reduce((sum, session) => sum + session.unreadCount, 0)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-6 h-6 text-blue-500" />
              <h1 className="text-xl font-bold text-gray-900">Chat Manager</h1>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>Welcome, {userName}</span>
            {totalUnread > 0 && (
              <div className="flex items-center space-x-1 ml-auto">
                <Bell className="w-4 h-4 text-orange-500" />
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">{totalUnread}</span>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-1">
            {(["all", "active", "unread"] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filter === filterType ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No sessions found</p>
              <p className="text-sm">Sessions will appear here when users join</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedSession === session.id
                      ? "bg-blue-50 border-blue-200 border"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">Session {session.id}</span>
                    {session.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {session.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{session.users.length}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{session.messageCount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(session.lastActivity).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  {session.users.length > 0 && (
                    <div className="mt-1 text-xs text-gray-400">Users: {session.users.join(", ")}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedSession ? (
          <div className="flex flex-col h-full">
            <div className="bg-white border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">Session {selectedSession}</h2>
              <p className="text-sm text-gray-500">Managing chat session</p>
            </div>
            <div className="flex-1">
              <Chat
                sessionId={selectedSession}
                userName={userName}
                role="owner"
                onMarkAsRead={() => handleMarkAsRead(selectedSession)}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Session</h3>
              <p className="text-gray-500">Choose a session from the sidebar to start managing the chat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OwnerDashboard
