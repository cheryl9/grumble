import { io } from "socket.io-client";
import { getAuthToken } from "./authService";

let socket = null;

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
  return apiUrl.replace(/\/api\/?$/, "");
};

export const getRealtimeSocket = () => {
  const token = getAuthToken();

  if (!token) {
    disconnectRealtimeSocket();
    return null;
  }

  if (socket && socket.connected && socket.auth?.token === token) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(getSocketUrl(), {
    transports: ["websocket"],
    auth: { token },
    withCredentials: true,
    autoConnect: true,
  });

  return socket;
};

export const disconnectRealtimeSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};

export const subscribeToRoom = (roomId, handlers = {}) => {
  const realtimeSocket = getRealtimeSocket();
  if (!realtimeSocket || !roomId) return null;

  const numericRoomId = Number(roomId);
  if (!Number.isInteger(numericRoomId)) return realtimeSocket;

  realtimeSocket.emit("subscribe", { room_id: numericRoomId }, handlers.ack);
  return realtimeSocket;
};

export const unsubscribeFromRoom = (roomId, ack) => {
  if (!socket || !roomId) return;

  const numericRoomId = Number(roomId);
  if (!Number.isInteger(numericRoomId)) return;

  socket.emit("unsubscribe", { room_id: numericRoomId }, ack);
};
