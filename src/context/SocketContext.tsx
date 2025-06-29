"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context.socket
}

interface SocketProviderProps {
  children: React.ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Only initialize socket on client side
    if (typeof window !== "undefined") {
      const socketInstance = io(process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000", {
        transports: ["websocket", "polling"],
      })

      socketInstance.on("connect", () => {
        setIsConnected(true)
        console.log("Connected to server")
      })

      socketInstance.on("disconnect", () => {
        setIsConnected(false)
        console.log("Disconnected from server")
      })

      setSocket(socketInstance)

      return () => {
        socketInstance.disconnect()
      }
    }
  }, [])

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}
