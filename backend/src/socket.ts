import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;

export const initSocket = (server: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[WebSocket]: Client connected -> ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`[WebSocket]: Client disconnected -> ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const emitNewOrder = (orderData: any) => {
  if (io) {
    console.log(`[WebSocket]: Emitting new_order event for Order #${orderData.orderNumber}`);
    io.emit("new_order", orderData);
  }
};

export const emitOrderStatusUpdate = (data: { orderId: string; status: string; orderNumber?: number; order?: any }) => {
  if (io) {
    console.log(`[WebSocket]: Emitting order_status_updated for Order #${data.orderNumber || data.orderId} -> ${data.status}`);
    io.emit("order_status_updated", data);
  }
};

export const emitBulkOrderUpdate = (data: { orderIds: string[]; status: string }) => {
  if (io) {
    console.log(`[WebSocket]: Emitting bulk_orders_updated for ${data.orderIds.length} orders -> ${data.status}`);
    io.emit("bulk_orders_updated", data);
  }
};
