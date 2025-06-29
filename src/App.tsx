"use client"

import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./components/LoginPage"
import OwnerDashboard from "./components/OwnerDashboard"
import UserChat from "./components/UserChat"

interface User {
  name: string
  role: string
  sessionId?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isConnected] = useState(true) // For demo purposes

  const handleLogin = (userData: User) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
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
                <OwnerDashboard user={user} onLogout={handleLogout} isConnected={isConnected} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/chat"
            element={
              user?.role === "user" && user.sessionId ? (
                <UserChat user={user} onLogout={handleLogout} isConnected={isConnected} />
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
