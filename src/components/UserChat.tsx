"use client"

import type React from "react"

import { LogOut, MessageCircle, Wifi, WifiOff } from "lucide-react"
import type { Socket } from "socket.io-client"
import Chat from "./Chat"

interface UserChatProps {
  socket: Socket | null
  user: { name: string; role: string; sessionId?: string }
  onLogout: () => void
  isConnected: boolean
}

const UserChat: React.FC<UserChatProps> = ({ socket, user, onLogout, isConnected }) => {
  if (!user.sessionId) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <div className="text-red-600 mb-4">
            <MessageCircle className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Session Error</h1>
          <p className="text-red-600 mb-4">No session ID found. Please try logging in again.</p>
          <button onClick={onLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Chat Support</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Connected as {user.name}</span>
                <div className="flex items-center space-x-1">
                  {isConnected ? (
                    <>
                      <Wifi className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-600">Connecting...</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Leave Chat</span>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1">
        <Chat socket={socket} sessionId={user.sessionId} userName={user.name} role="user" />
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 p-2">
        <div className="text-center">
          <p className="text-xs text-gray-500">Session ID: {user.sessionId.split("_")[1]} • Powered by Socket.IO</p>
        </div>
      </div>
    </div>
  )
}

export default UserChat
