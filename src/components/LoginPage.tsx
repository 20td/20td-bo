"use client"

import type React from "react"
import { useState } from "react"
import { MessageCircle, User, Crown } from "lucide-react"

interface LoginPageProps {
  onLogin: (user: { name: string; role: "user" | "owner"; sessionId?: string }) => void
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [name, setName] = useState("")
  const [role, setRole] = useState<"user" | "owner">("user")
  const [sessionId, setSessionId] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const userData = {
      name: name.trim(),
      role,
      ...(role === "user" && sessionId.trim() && { sessionId: sessionId.trim() }),
    }

    onLogin(userData)
  }

  const generateSessionId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase()
    setSessionId(id)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <MessageCircle className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Chat</h1>
          <p className="text-gray-600 mt-2">Join the conversation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === "user" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <User className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">User</div>
                <div className="text-xs text-gray-500">Join a chat</div>
              </button>
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === "owner"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Crown className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Owner</div>
                <div className="text-xs text-gray-500">Manage chats</div>
              </button>
            </div>
          </div>

          {role === "user" && (
            <div>
              <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700 mb-2">
                Session ID (Optional)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="sessionId"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter session ID"
                />
                <button
                  type="button"
                  onClick={generateSessionId}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Generate
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave empty to create a new session</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {role === "owner" ? "Start Managing Chats" : "Join Chat"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
