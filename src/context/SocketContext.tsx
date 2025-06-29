"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

interface SocketContextType {
  socket: Socket | null
}

const SocketContext = createContext<SocketContextType>({ socket: null })

export const useSocket = () => {
  const context = useContext(SocketContext)
  return context.socket
}

interface SocketProviderProps {
  children: React.ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
    })

    newSocket.on("connect", () => {
      console.log("Connected to server")
    })

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server")
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
}
