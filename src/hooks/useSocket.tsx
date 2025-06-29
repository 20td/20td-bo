"use client"

import { useEffect, useState, useRef } from "react"
import { io, type Socket } from "socket.io-client"

interface UseSocketOptions {
  autoConnect?: boolean
  reconnection?: boolean
  reconnectionAttempts?: number
  reconnectionDelay?: number
}

export const useSocket = (url = "http://localhost:5000", options: UseSocketOptions = {}) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  const defaultOptions = {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    ...options,
  }

  useEffect(() => {
    const newSocket = io(url, {
      transports: ["websocket", "polling"],
      upgrade: true,
      rememberUpgrade: true,
      ...defaultOptions,
    })

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("✅ Connected to server:", newSocket.id)
      setIsConnected(true)
      setConnectionError(null)
      setSocket(newSocket)
    })

    newSocket.on("disconnect", (reason) => {
      console.log("🔌 Disconnected from server:", reason)
      setIsConnected(false)
      setSocket(null)

      // Auto-reconnect logic
      if (defaultOptions.reconnection && reason === "io server disconnect") {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔄 Attempting to reconnect...")
          newSocket.connect()
        }, defaultOptions.reconnectionDelay)
      }
    })

    newSocket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error.message)
      setConnectionError(error.message)
      setIsConnected(false)
    })

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`)
      setIsConnected(true)
      setConnectionError(null)
    })

    newSocket.on("reconnect_error", (error) => {
      console.error("❌ Reconnection error:", error.message)
      setConnectionError(`Reconnection failed: ${error.message}`)
    })

    newSocket.on("reconnect_failed", () => {
      console.error("❌ Failed to reconnect after maximum attempts")
      setConnectionError("Failed to reconnect to server")
    })

    if (defaultOptions.autoConnect) {
      console.log("🔌 Connecting to Socket.IO server...")
      newSocket.connect()
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      newSocket.close()
    }
  }, [url, options])

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }

  const reconnect = () => {
    if (socket) {
      socket.connect()
    }
  }

  return {
    socket,
    isConnected,
    connectionError,
    disconnect,
    reconnect,
  }
}
