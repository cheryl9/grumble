let io = null;

const roomChannel = (roomId) => `room:${roomId}`;
const userChannel = (userId) => `user:${userId}`;

// In-memory presence tracking (best-effort, resets on server restart)
const connectedSocketsByUser = new Map(); // userId -> Set(socketId)
const activeRoomUserCounts = new Map(); // roomId -> Map(userId -> count)

const setSocketServer = (ioInstance) => {
  io = ioInstance;
};

const registerUserSocket = (userId, socketId) => {
  const uid = Number(userId);
  if (!Number.isInteger(uid)) return;

  const existing = connectedSocketsByUser.get(uid);
  if (existing) {
    existing.add(socketId);
    return;
  }

  connectedSocketsByUser.set(uid, new Set([socketId]));
};

const unregisterUserSocket = (userId, socketId) => {
  const uid = Number(userId);
  if (!Number.isInteger(uid)) return;

  const existing = connectedSocketsByUser.get(uid);
  if (!existing) return;

  existing.delete(socketId);
  if (existing.size === 0) connectedSocketsByUser.delete(uid);
};

const markUserActiveInRoom = (roomId, userId) => {
  const rid = Number(roomId);
  const uid = Number(userId);
  if (!Number.isInteger(rid) || !Number.isInteger(uid)) return;

  if (!activeRoomUserCounts.has(rid)) activeRoomUserCounts.set(rid, new Map());
  const roomMap = activeRoomUserCounts.get(rid);

  const current = roomMap.get(uid) || 0;
  roomMap.set(uid, current + 1);
};

const unmarkUserActiveInRoom = (roomId, userId) => {
  const rid = Number(roomId);
  const uid = Number(userId);
  if (!Number.isInteger(rid) || !Number.isInteger(uid)) return;

  const roomMap = activeRoomUserCounts.get(rid);
  if (!roomMap) return;

  const current = roomMap.get(uid) || 0;
  if (current <= 1) {
    roomMap.delete(uid);
  } else {
    roomMap.set(uid, current - 1);
  }

  if (roomMap.size === 0) activeRoomUserCounts.delete(rid);
};

const isUserConnected = (userId) => {
  const uid = Number(userId);
  if (!Number.isInteger(uid)) return false;
  return (connectedSocketsByUser.get(uid)?.size || 0) > 0;
};

const isUserActiveInRoom = (roomId, userId) => {
  const rid = Number(roomId);
  const uid = Number(userId);
  if (!Number.isInteger(rid) || !Number.isInteger(uid)) return false;
  return (activeRoomUserCounts.get(rid)?.get(uid) || 0) > 0;
};

/**
 * Broadcast a standardized envelope to all subscribers of a room.
 * Envelope:
 * {
 *   event: 'new_message'|'reaction_update'|'poll_update'|'spin_result',
 *   room_id: number,
 *   payload: object
 * }
 */
const broadcastRoomEvent = (roomId, event, payload) => {
  if (!io) return;

  const numericRoomId = Number(roomId);
  if (!Number.isInteger(numericRoomId)) return;

  io.to(roomChannel(numericRoomId)).emit("room_event", {
    event,
    room_id: numericRoomId,
    payload,
  });
};

/**
 * In-app notification for connected users (not tied to a room subscription).
 */
const sendNotificationAlert = (userId, payload) => {
  if (!io) return;

  const uid = Number(userId);
  if (!Number.isInteger(uid)) return;

  io.to(userChannel(uid)).emit("notification_alert", payload);
};

module.exports = {
  roomChannel,
  userChannel,
  setSocketServer,
  broadcastRoomEvent,
  sendNotificationAlert,
  registerUserSocket,
  unregisterUserSocket,
  markUserActiveInRoom,
  unmarkUserActiveInRoom,
  isUserConnected,
  isUserActiveInRoom,
};
