"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { LogOut, MessageCircle, Users, Clock, Bell, Crown, Search } from "lucide-react"
import type { Socket } from "socket.io-client"
import Chat from "./Chat"

interface Session {
  sessionId: string
  userName: string
  isActive: boolean
  lastActivity: string
  unreadCount: number
  messageCount: number
  lastMessage?: {
    sender: string
    text: string
    timestamp: string
    role: string
  }
}

interface OwnerDashboardProps {
  socket: Socket | null
  user: { name: string; role: string }
  onLogout: () => void
  isConnected: boolean
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ socket, user, onLogout, isConnected }) => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all")
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    if (!socket || !isConnected) return

    // Join all sessions as owner
    socket.emit("owner-join-all-sessions")
    socket.emit("get-sessions")

    // Socket event listeners
    const handleSessionUpdated = (sessionData: Session) => {
      setSessions((prev) => {
        const existing = prev.find((s) => s.sessionId === sessionData.sessionId)
        if (existing) {
          return prev.map((s) => (s.sessionId === sessionData.sessionId ? sessionData : s))
        } else {
          return [...prev, sessionData]
        }
      })
    }

    const handleAllSessions = (allSessions: Session[]) => {
      setSessions(allSessions)
    }

    const handleSessionsList = (sessionsList: Session[]) => {
      setSessions(sessionsList)
    }

    const handleNewMessageNotification = ({ sessionId, message, sessionData }: any) => {
      if (activeSession !== sessionId) {
        setNotifications((prev) => new Set([...prev, sessionId]))
        if (soundEnabled) {
          playNotificationSound()
        }
      }

      // Update session data
      setSessions((prev) => {
        const existing = prev.find((s) => s.sessionId === sessionId)
        if (existing) {
          return prev.map((s) => (s.sessionId === sessionId ? sessionData : s))
        } else {
          return [...prev, sessionData]
        }
      })
    }

    // Register event listeners
    socket.on("session-updated", handleSessionUpdated)
    socket.on("all-sessions", handleAllSessions)
    socket.on("sessions-list", handleSessionsList)
    socket.on("new-message-notification", handleNewMessageNotification)

    return () => {
      socket.off("session-updated", handleSessionUpdated)
      socket.off("all-sessions", handleAllSessions)
      socket.off("sessions-list", handleSessionsList)
      socket.off("new-message-notification", handleNewMessageNotification)
    }
  }, [socket, isConnected, activeSession, soundEnabled])

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.warn("Could not play notification sound:", error)
    }
  }

  const handleSessionClick = (sessionId: string) => {
    setActiveSession(sessionId)
    setNotifications((prev) => {
      const newNotifications = new Set(prev)
      newNotifications.delete(sessionId)
      return newNotifications
    })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  const filteredSessions = sessions
    .filter((session) => {
      const matchesSearch =
        session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.sessionId.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter =
        filterActive === "all" ||
        (filterActive === "active" && session.isActive) ||
        (filterActive === "inactive" && !session.isActive)
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      // Sort by: unread messages first, then by last activity
      if (a.unreadCount !== b.unreadCount) {
        return b.unreadCount - a.unreadCount
      }
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    })

  const activeSessions = sessions.filter((s) => s.isActive)
  const totalUnread = sessions.reduce((sum, s) => sum + s.unreadCount, 0)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">Owner Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome, {user.name}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Connection Status */}
          <div
            className={`flex items-center justify-center p-2 rounded-lg text-sm ${
              isConnected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
            {isConnected ? "Connected" : "Disconnected"}
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <Users className="w-4 h-4 mx-auto mb-1 text-green-600" />
              <div className="text-lg font-bold text-green-900">{activeSessions.length}</div>
              <div className="text-xs text-green-700">Active</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <Bell className="w-4 h-4 mx-auto mb-1 text-blue-600" />
              <div className="text-lg font-bold text-blue-900">{totalUnread}</div>
              <div className="text-xs text-blue-700">Unread</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <MessageCircle className="w-4 h-4 mx-auto mb-1 text-purple-600" />
              <div className="text-lg font-bold text-purple-900">{sessions.length}</div>
              <div className="text-xs text-purple-700">Total</div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="flex space-x-1">
            {(["all", "active", "inactive"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterActive(filter)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filterActive === filter ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No sessions found</p>
              <p className="text-sm text-gray-400">
                {searchTerm ? "Try adjusting your search" : "Sessions will appear here when users start chatting"}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredSessions.map((session) => (
                <div
                  key={session.sessionId}
                  onClick={() => handleSessionClick(session.sessionId)}
                  className={`p-3 rounded-lg cursor-pointer transition-all relative ${
                    activeSession === session.sessionId
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 truncate">{session.userName}</h4>
                      {session.isActive && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                          {session.unreadCount > 99 ? "99+" : session.unreadCount}
                        </span>
                      )}
                      {notifications.has(session.sessionId) && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 truncate flex-1">Session: {session.sessionId.split("_")[1]}</span>
                    <div className="flex items-center text-gray-400 ml-2">
                      <Clock className="w-3 h-3 mr-1" />
                      <span className="text-xs">{formatTime(session.lastActivity)}</span>
                    </div>
                  </div>

                  {session.lastMessage && (
                    <p className="text-sm text-gray-600 truncate mt-1">
                      <span className="font-medium">{session.lastMessage.sender}:</span> {session.lastMessage.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-gray-200">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Sound notifications</span>
          </label>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeSession ? (
          <Chat
            socket={socket}
            sessionId={activeSession}
            userName={user.name}
            role="owner"
            onMarkAsRead={() => {
              if (socket) {
                socket.emit("mark-messages-read", { sessionId: activeSession })
              }
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a session to start chatting</h3>
              <p className="text-gray-500">Choose a session from the sidebar to view the conversation</p>
              {sessions.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">Waiting for users to start new chat sessions...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OwnerDashboard
