import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("[WebSocket]: Connected to Kinenao backend ->", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket]: Disconnected from backend socket");
    });
  }

  return socket;
};
