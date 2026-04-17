"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { getSocketToken } from "@/lib/auth-api";
import { connectSocket } from "@/lib/socket";
import { useAuth } from "@/contexts/auth-context";

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let cancelled = false;

    const disconnectCurrentSocket = () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };

    if (!isAuthenticated) {
      disconnectCurrentSocket();
      return;
    }

    const connect = async () => {
      try {
        const { token } = await getSocketToken();
        if (cancelled) {
          return;
        }

        const nextSocket = connectSocket(token);
        socketRef.current = nextSocket;
        setSocket(nextSocket);

        nextSocket.on("connect", () => setConnected(true));
        nextSocket.on("disconnect", () => setConnected(false));
      } catch {
        disconnectCurrentSocket();
      }
    };

    void connect();

    return () => {
      cancelled = true;
      disconnectCurrentSocket();
    };
  }, [isAuthenticated]);

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
