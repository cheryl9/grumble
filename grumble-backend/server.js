require("dotenv").config();
const app = require("./app");
//const { syncFoodPlaces } = require("./services/syncService");

const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const pool = require("./config/db");
const chatRoomRepository = require("./repositories/chatRoomRepository");
const {
  setSocketServer,
  roomChannel,
  userChannel,
  registerUserSocket,
  unregisterUserSocket,
  markUserActiveInRoom,
  unmarkUserActiveInRoom,
} = require("./services/realtime");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : true;

const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});

// Authenticate socket connections using the same JWT secret as the REST API.
io.use(async (socket, next) => {
  try {
    const authHeader = socket.handshake.headers?.authorization;
    const tokenFromHeader =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    const token = socket.handshake.auth?.token || tokenFromHeader;

    if (!token) {
      return next(new Error("unauthorized"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "grumble-secret-key",
    );

    const userCheck = await pool.query(
      "SELECT id, username, account_status, is_deleted, frozen_reason FROM users WHERE id = $1",
      [decoded.id],
    );

    const user = userCheck.rows[0];

    if (!user || user.is_deleted) {
      return next(new Error("unauthorized"));
    }

    if (user.account_status === "frozen") {
      return next(new Error("frozen"));
    }

    socket.user = { id: user.id, username: user.username };
    return next();
  } catch (err) {
    return next(new Error("unauthorized"));
  }
});

io.on("connection", (socket) => {
  socket.data.subscribedRoomIds = new Set();

  // Join a per-user channel for direct in-app notifications.
  socket.join(userChannel(socket.user.id));
  registerUserSocket(socket.user.id, socket.id);

  socket.on("subscribe", async (data, ack) => {
    try {
      const roomId = Number(data?.room_id);
      if (!Number.isInteger(roomId)) {
        if (typeof ack === "function")
          ack({ ok: false, message: "room_id must be an integer" });
        return;
      }

      const isMember = await chatRoomRepository.isMemberOfRoom(
        roomId,
        socket.user.id,
      );
      if (!isMember) {
        if (typeof ack === "function")
          ack({ ok: false, message: "not a room member" });
        return;
      }

      await socket.join(roomChannel(roomId));
      if (!socket.data.subscribedRoomIds.has(roomId)) {
        socket.data.subscribedRoomIds.add(roomId);
        markUserActiveInRoom(roomId, socket.user.id);
      }

      if (typeof ack === "function") ack({ ok: true, room_id: roomId });
    } catch (err) {
      if (typeof ack === "function")
        ack({ ok: false, message: "subscribe failed" });
    }
  });

  socket.on("unsubscribe", async (data, ack) => {
    const roomId = Number(data?.room_id);
    if (!Number.isInteger(roomId)) {
      if (typeof ack === "function")
        ack({ ok: false, message: "room_id must be an integer" });
      return;
    }

    await socket.leave(roomChannel(roomId));

    if (socket.data.subscribedRoomIds.has(roomId)) {
      socket.data.subscribedRoomIds.delete(roomId);
      unmarkUserActiveInRoom(roomId, socket.user.id);
    }

    if (typeof ack === "function") ack({ ok: true, room_id: roomId });
  });

  socket.on("disconnect", () => {
    unregisterUserSocket(socket.user.id, socket.id);

    for (const roomId of socket.data.subscribedRoomIds) {
      unmarkUserActiveInRoom(roomId, socket.user.id);
    }

    socket.data.subscribedRoomIds.clear();
  });
});

setSocketServer(io);

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🚀 Connected to Supabase DB`);
});
