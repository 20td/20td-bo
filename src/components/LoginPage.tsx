"use client"

import type React from "react"

import { useState } from "react"
import { User, Crown, MessageCircle, Wifi, WifiOff } from "lucide-react"

interface LoginPageProps {
  onLogin: (userData: { name: string; role: string; sessionId?: string }) => void
  isConnected?: boolean
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, isConnected = true }) => {
  const [name, setName] = useState("")
  const [role, setRole] = useState<"user" | "owner">("user")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !isConnected) return

    setIsLoading(true)

    try {
      const sessionId = role === "user" ? `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : undefined

      // Simulate a brief loading state
      await new Promise((resolve) => setTimeout(resolve, 500))

      onLogin({
        name: name.trim(),
        role,
        sessionId,
      })
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ChatApp</h1>
          <p className="text-gray-600">Real-time communication platform</p>
        </div>

        {/* Connection Status */}
        <div
          className={`flex items-center justify-center mb-6 p-3 rounded-lg ${
            isConnected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Connected to server</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Connecting to server...</span>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your name"
                required
                disabled={!isConnected || isLoading}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("user")}
                disabled={!isConnected || isLoading}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === "user"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                } ${!isConnected || isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <User className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">User</div>
                <div className="text-xs text-gray-500">Join chat session</div>
              </button>

              <button
                type="button"
                onClick={() => setRole("owner")}
                disabled={!isConnected || isLoading}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === "owner"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                } ${!isConnected || isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <Crown className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Owner</div>
                <div className="text-xs text-gray-500">Manage all chats</div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name.trim() || !isConnected || isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connecting...
              </>
            ) : role === "owner" ? (
              "Access Dashboard"
            ) : (
              "Start Chatting"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">Powered by Socket.IO • Real-time messaging</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
