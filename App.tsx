"use client"

import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./components/LoginPage"
import OwnerDashboard from "./components/OwnerDashboard"
import UserChat from "./components/UserChat"
import { SocketProvider } from "./context/SocketContext"

function App() {
  const [user, setUser] = useState<{ name: string; role: string; sessionId?: string } | null>(null)

  const handleLogin = (userData: { name: string; role: string; sessionId?: string }) => {
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
                <LoginPage onLogin={handleLogin} />
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
                <SocketProvider>
                  <OwnerDashboard user={user} onLogout={handleLogout} />
                </SocketProvider>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/chat"
            element={
              user?.role === "user" ? (
                <SocketProvider>
                  <UserChat user={user} onLogout={handleLogout} />
                </SocketProvider>
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
