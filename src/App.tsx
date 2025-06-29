"use client"

import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./components/LoginPage"
import OwnerDashboard from "./components/OwnerDashboard"
import UserChat from "./components/UserChat"
import { useSocket } from "./hooks/useSocket"

interface User {
  name: string
  role: string
  sessionId?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const { socket, isConnected, connectionError } = useSocket()

  const handleLogin = (userData: User) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
    if (socket) {
      socket.disconnect()
    }
  }

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Connection Error</h1>
          <p className="text-red-600 mb-4">{connectionError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              !user ? (
                <LoginPage onLogin={handleLogin} isConnected={isConnected} />
              ) : user.role === "owner" ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/chat" replace />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              user?.role === "owner" ? (
                <OwnerDashboard socket={socket} user={user} onLogout={handleLogout} isConnected={isConnected} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/chat"
            element={
              user?.role === "user" && user.sessionId ? (
                <UserChat socket={socket} user={user} onLogout={handleLogout} isConnected={isConnected} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Router>
    </div>
  )
}

export default App
