"use client"

import type React from "react"

import { useState } from "react"
import { User, Crown, MessageCircle } from "lucide-react"

interface LoginPageProps {
  onLogin: (userData: { name: string; role: string; sessionId?: string }) => void
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [name, setName] = useState("")
  const [role, setRole] = useState<"user" | "owner">("user")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      const sessionId = role === "user" ? `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : undefined
      onLogin({ name: name.trim(), role, sessionId })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ChatApp</h1>
          <p className="text-gray-600">Join the conversation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                required
              />
            </div>
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
                <div className="text-xs text-gray-500">Join chat session</div>
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
                <div className="text-xs text-gray-500">Manage all chats</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {role === "owner" ? "Access Dashboard" : "Start Chatting"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
