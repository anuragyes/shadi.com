import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // frontend URL
    methods: ["GET", "POST"],
  },
});


const onlineUsers = new Map();

  console.log("this is is is is is is is is is is is is  onlineUsers" , onlineUsers)

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // 1️⃣ User comes online
  socket.on("user-online", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("🟢 Online users:", onlineUsers);
  });

  // 2️⃣ Call request (video / voice)
  socket.on("call-user", ({ from, to, callId }) => {
    console.log(`📞 Call from ${from} to ${to}`);

    const receiverSocketId = onlineUsers.get(to);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming-call", {
        from,
        callId,
      });
    } else {
      socket.emit("user-offline", { to });
    }
  });

  // 3️⃣ Call accepted
  socket.on("accept-call", ({ from, to, callId }) => {
    console.log(`✅ Call accepted by ${from}`);

    const callerSocketId = onlineUsers.get(to);

    if (callerSocketId) {
      io.to(callerSocketId).emit("call-accepted", {
        from,
        callId,
      });
    }
  });

  // 4️⃣ Call rejected
  socket.on("reject-call", ({ to }) => {
    console.log(`❌ Call rejected`);

    const callerSocketId = onlineUsers.get(to);

    if (callerSocketId) {
      io.to(callerSocketId).emit("call-rejected");
    }
  });

  // 5️⃣ Handle disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);

    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    console.log("🟡 Online users after disconnect:", onlineUsers);
  });
});

server.listen(5000, () => {
  console.log("🚀 Signaling server running on port 5000");
});
