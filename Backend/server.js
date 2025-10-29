

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import Userrouter from "./Routes/UserRoutes.js";
import connectionDb from "./config/db.js";
import ChatRoutes from "./Routes/chatRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://shaddi-com-85e6.onrender.com", // your React app
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: "https://shaddi-com-85e6.onrender.com", credentials: true }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/user", Userrouter);
app.use("/api/user/request", ChatRoutes);

// ✅ --- SOCKET.IO LOGIC ---
const onlineUsers = new Map(); // userId => socket.id
const userRooms = new Map();   // socket.id => roomId (optional tracking)

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // ✅ User goes online
  socket.on("userOnline", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`✅ ${userId} is online (socket ${socket.id})`);
  });

  // ✅ User joins a specific chat room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    userRooms.set(socket.id, roomId);
    console.log(`👥 Socket ${socket.id} joined room ${roomId}`);
  });

  // ✅ Friend request accepted (optional feature)
  socket.on("friendRequestAccepted", ({ fromUserId, toUserId }) => {
    const toSocket = onlineUsers.get(toUserId);
    if (toSocket) {
      io.to(toSocket).emit("newFriend", { fromUserId, toUserId });
    }
  });

  // ✅ Send and broadcast messages
  socket.on("sendMessage", ({ from, to, message }) => {
    // If receiver is online, send directly
    const toSocket = onlineUsers.get(to);
    if (toSocket) {
      io.to(toSocket).emit("receiveMessage", { from, message });
    }

    // If both are in same chat room, also broadcast in the room
    const currentRoom = userRooms.get(socket.id);
    if (currentRoom) {
      io.to(currentRoom).emit("receiveMessage", { from, message });
    }
  });

  // ✅ Handle disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    for (let [userId, sId] of onlineUsers) {
      if (sId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    userRooms.delete(socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectionDb();
    console.log("✅ Database connected successfully");
    server.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
