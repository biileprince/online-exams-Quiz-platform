import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "@/lib/config";

export function connectSocket(token: string): Socket {
  return io(SOCKET_URL, {
    transports: ["websocket"],
    auth: {
      token,
    },
  });
}
