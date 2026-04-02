"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Socket } from "socket.io-client";
import { connectSocket } from "@/lib/socket";
import { useAuth } from "@/contexts/auth-context";

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      socket?.disconnect();
      setSocket(null);
      setConnected(false);
      return;
    }

    const nextSocket = connectSocket(accessToken);
    setSocket(nextSocket);

    nextSocket.on("connect", () => setConnected(true));
    nextSocket.on("disconnect", () => setConnected(false));

    return () => {
      nextSocket.disconnect();
      setConnected(false);
    };
  }, [accessToken]);

  const value = useMemo(() => ({ socket, connected }), [socket, connected]);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
