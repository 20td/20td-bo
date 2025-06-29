"use client"

import type React from "react"
import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./components/LoginPage"
import OwnerDashboard from "./components/OwnerDashboard"
import UserChat from "./components/UserChat"
import { SocketProvider } from "./context/SocketContext"

interface User {
  name: string
  role: "user" | "owner"
  sessionId?: string
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)

  const handleLogin = (userData: User) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <SocketProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route
              path="/"
              element={
                user.role === "owner" ? (
                  <OwnerDashboard userName={user.name} onLogout={handleLogout} />
                ) : (
                  <UserChat userName={user.name} sessionId={user.sessionId || ""} onLogout={handleLogout} />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  )
}

export default App
