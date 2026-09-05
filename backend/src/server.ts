import http from "http";
import app from "./app";
import dotenv from "dotenv";
import { initSocket } from "./socket";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io WebSocket server
initSocket(server);

server.listen(PORT, () => {
  console.log(`[Server]: Kinenao backend & WebSocket running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: any) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});
