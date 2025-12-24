
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import Userrouter from "./Routes/UserRoutes.js";
import ChatRoutes from "./Routes/chatRoutes.js";
import ReelRouter from "./Routes/ReelRoutes.js";
import UpdateField from "./Routes/Updatefield.js";
import StoryRouter from "./Routes/putStory.js";
import connectionDb from "./config/db.js";
import InfoRouter from "./Routes/Small_info_routes.js";
import ProfileRouter from "./Routes/ProfileRouter.js";

import verificationRouter from "./Routes/payment_verification.js";
import Razorpayrouter from "./Routes/RazorpayRoutes.js";
import historypayment from "./Routes/PaymentHistoryRouter.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* =======================
   SOCKET.IO CONFIG
======================= */
const io = new Server(server, {
  cors: {
    origin: "https://shaddi-com-85e6.onrender.com",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
});

/* =======================
   MIDDLEWARE
======================= */
app.use(cors({ 
  origin: "https://shaddi-com-85e6.onrender.com", 
  credentials: true 
}));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json());
app.use(cookieParser());

/* =======================
   ROUTES
======================= */
app.use("/api/user", Userrouter);
app.use("/api/user/request", ChatRoutes);
app.use("/api/reel", ReelRouter);
app.use("/api/updateprofileofuser", UpdateField);
app.use("/api/userstory", StoryRouter);
app.use("/api/mutual" , InfoRouter);
app.use("/api/visable" , ProfileRouter);
app.use("/api/payment" , Razorpayrouter)
app.use("/api/payment-verification" , verificationRouter);
app.use("/api/payment/history" , historypayment);

/* =======================
   SOCKET STATE MANAGEMENT
======================= */
const userSockets = new Map();          // userId -> socket.id
const socketUsers = new Map();          // socket.id -> userId
const pendingCalls = new Map();         // userId -> [{ from, callId, timestamp }]
const activeCalls = new Map();          // callId -> { participants: [userId1, userId2] }
const chatRooms = new Map();            // roomId -> Set of socket.id
const typingUsers = new Map();          // userId -> {roomId, lastTypingTime}

/* =======================
   HELPER FUNCTIONS
======================= */
const getUserSocket = (userId) => {
  return userSockets.get(userId);
};

const isUserOnline = (userId) => {
  return userSockets.has(userId);
};

const deliverPendingCalls = (userId, socketId) => {
  if (pendingCalls.has(userId)) {
    const calls = pendingCalls.get(userId);
    const now = Date.now();
    const thirtySecondsAgo = now - 30000;
    
    // Filter out old pending calls (> 30 seconds)
    const validCalls = calls.filter(call => call.timestamp > thirtySecondsAgo);
    
    validCalls.forEach(call => {
      const callData = {
        from: call.from,
        callId: call.callId,
        timestamp: call.timestamp
      };
      
      // ✅ Include stored offer if available
      if (call.offer) {
        callData.offer = call.offer;
      }
      
      io.to(socketId).emit("incoming-call", callData);
      console.log(`📨 Delivered pending call to ${userId}`, 
        call.offer ? "WITH offer" : "WITHOUT offer");
    });
    
    // Update pending calls with only valid ones
    pendingCalls.set(userId, validCalls);
  }
};

// Chat helper functions
const joinChatRoom = (socket, roomId, userId) => {
  socket.join(roomId);
  
  if (!chatRooms.has(roomId)) {
    chatRooms.set(roomId, new Set());
  }
  chatRooms.get(roomId).add(socket.id);
  
  console.log(`👤 ${userId} (${socket.id}) joined chat room: ${roomId}`);
};

const leaveChatRoom = (socket, roomId, userId) => {
  socket.leave(roomId);
  
  if (chatRooms.has(roomId)) {
    chatRooms.get(roomId).delete(socket.id);
    if (chatRooms.get(roomId).size === 0) {
      chatRooms.delete(roomId);
    }
  }
  
  console.log(`👤 ${userId} (${socket.id}) left chat room: ${roomId}`);
};

const cleanupOldCalls = () => {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  // Cleanup pending calls older than 1 minute
  for (const [userId, calls] of pendingCalls.entries()) {
    const validCalls = calls.filter(call => call.timestamp > oneMinuteAgo);
    if (validCalls.length === 0) {
      pendingCalls.delete(userId);
    } else {
      pendingCalls.set(userId, validCalls);
    }
  }
  
  // Cleanup typing status older than 5 seconds
  for (const [userId, typingData] of typingUsers.entries()) {
    if (now - typingData.lastTypingTime > 5000) {
      typingUsers.delete(userId);
    }
  }
};

/* =======================
   SOCKET EVENT HANDLERS
======================= */
io.on("connection", (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);
  
  // User comes online
  socket.on("userOnline", (userId) => {
    if (!userId) {
      console.error("❌ userOnline: userId is required");
      return;
    }
    
    userSockets.set(userId, socket.id);
    socketUsers.set(socket.id, userId);
    
    console.log(`✅ User online: ${userId} -> ${socket.id}`);
    
    // Deliver any pending calls
    deliverPendingCalls(userId, socket.id);
  });

  /* =======================
     CHAT REAL-TIME EVENTS
  ======================= */
  
  // Join chat room
  socket.on("joinRoom", (roomId) => {
    const userId = socketUsers.get(socket.id);
    if (roomId && userId) {
      joinChatRoom(socket, roomId, userId);
      
      // Notify others in the room (optional)
      socket.to(roomId).emit("userJoinedRoom", {
        userId,
        roomId,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Leave chat room
  socket.on("leaveRoom", (roomId) => {
    const userId = socketUsers.get(socket.id);
    if (roomId && userId) {
      leaveChatRoom(socket, roomId, userId);
    }
  });
  
  // Send message
  socket.on("sendMessage", (data) => {
    const { from, to, message, roomId } = data;
    const senderId = socketUsers.get(socket.id);
    
    if (!senderId || !message || !roomId) {
      console.error("❌ sendMessage: Missing required fields", data);
      return;
    }
    
    console.log(`💬 Message from ${senderId} to room ${roomId}: ${message.substring(0, 50)}...`);
    
    // Get recipient socket ID if sending to specific user
    const recipientSocketId = getUserSocket(to);
    
    // Create message object
    const messageData = {
      _id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: senderId,
      message: message,
      roomId: roomId,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    // 1. Broadcast to the chat room
    io.to(roomId).emit("newMessage", messageData);
    
    // 2. Send to specific recipient if they're not in the room
    if (to && recipientSocketId && !socket.rooms.has(roomId)) {
      io.to(recipientSocketId).emit("receiveMessage", {
        ...messageData,
        to: to
      });
    }
    
    // 3. Send delivery confirmation to sender
    socket.emit("messageSent", {
      success: true,
      messageId: messageData._id,
      timestamp: messageData.timestamp
    });
    
    // Log the message delivery
    console.log(`📤 Message delivered to room ${roomId} (${io.sockets.adapter.rooms.get(roomId)?.size || 0} users)`);
  });
  
  // Typing indicator
  socket.on("typing", (data) => {
    const { to, roomId, isTyping } = data;
    const userId = socketUsers.get(socket.id);
    
    if (!userId || !roomId) return;
    
    if (isTyping) {
      typingUsers.set(userId, {
        roomId,
        lastTypingTime: Date.now()
      });
    } else {
      typingUsers.delete(userId);
    }
    
    // Broadcast typing status to room
    socket.to(roomId).emit("typing", {
      from: userId,
      isTyping,
      roomId
    });
    
    // Also send to specific recipient if provided
    if (to) {
      const recipientSocketId = getUserSocket(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("typing", {
          from: userId,
          isTyping,
          roomId
        });
      }
    }
  });
  
  // Message read receipt
  socket.on("messageRead", (data) => {
    const { messageIds, roomId, from } = data;
    const userId = socketUsers.get(socket.id);
    
    if (!userId || !roomId || !messageIds?.length) return;
    
    console.log(`👁️ User ${userId} read messages in room ${roomId}:`, messageIds);
    
    // Notify sender that messages were read
    const senderSocketId = getUserSocket(from);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", {
        messageIds,
        readerId: userId,
        roomId,
        timestamp: new Date().toISOString()
      });
    }
    
    // Broadcast to room (optional)
    io.to(roomId).emit("messagesReadUpdate", {
      messageIds,
      readerId: userId,
      roomId
    });
  });
  
  // User online/offline status
  socket.on("getOnlineStatus", (userIds) => {
    const userId = socketUsers.get(socket.id);
    if (!userId) return;
    
    const status = {};
    userIds.forEach(id => {
      status[id] = isUserOnline(id);
    });
    
    socket.emit("onlineStatus", status);
  });
  
  /* =======================
     CALL RELATED EVENTS
  ======================= */
  
  socket.on("initiate-call", (data) => {
    console.log("🔍 INITIATE-CALL DATA RECEIVED:", {
      from: data.from,
      to: data.to,
      callId: data.callId,
      hasOffer: !!data.offer,
      offerType: typeof data.offer,
      offerKeys: data.offer ? Object.keys(data.offer) : 'none'
    });
    
    const { from, to, callId, offer } = data; // ✅ Extract offer too
    
    if (!from || !to || !callId) {
      console.error("❌ initiate-call: Missing required fields", data);
      socket.emit("call-error", { 
        callId, 
        error: "Missing required fields" 
      });
      return;
    }
    
    console.log(`📞 ${from} is calling ${to} | callId: ${callId}`, 
      `Has offer: ${!!offer}`);
    
    const targetSocketId = getUserSocket(to);
    
    if (targetSocketId) {
      // User is online - send call immediately WITH OFFER
      const callData = {
        from,
        callId,
        timestamp: Date.now()
      };
      
      // ✅ Include the offer if it exists
      if (offer) {
        callData.offer = offer;
      }
      
      io.to(targetSocketId).emit("incoming-call", callData);
      
      // Track the call as active
      activeCalls.set(callId, {
        participants: [from, to],
        startTime: Date.now(),
        status: "ringing"
      });
      
      console.log(`📨 Call delivered to ${to}`, offer ? "WITH offer" : "WITHOUT offer");
    } else {
      // User is offline - store in pending calls
      if (!pendingCalls.has(to)) {
        pendingCalls.set(to, []);
      }
      
      pendingCalls.get(to).push({
        from,
        callId,
        timestamp: Date.now(),
        offer: offer || null // ✅ Store offer if available
      });
      
      console.log(`💾 User ${to} is offline, call stored`);
      
      // Notify caller that recipient is offline
      socket.emit("call-status", {
        callId,
        status: "pending",
        message: "User is offline, call will be delivered when they come online"
      });
    }
    
    // Auto timeout after 30 seconds
    setTimeout(() => {
      if (activeCalls.has(callId) && 
        activeCalls.get(callId).status === "ringing") {
        
        activeCalls.delete(callId);
        
        // Notify both users
        socket.emit("call-timeout", { callId });
        if (targetSocketId) {
          io.to(targetSocketId).emit("call-timeout", { callId });
        }
        
        console.log(`⏰ Call ${callId} timed out`);
      }
    }, 30000);
  });
  
  // Accept call
  socket.on("accept-call", (data) => {
    const { callId, from, to } = data;
    
    console.log(`✅ ${from} accepted call ${callId}`);
    
    const targetSocketId = getUserSocket(to);
    
    if (targetSocketId) {
      // Update call status
      if (activeCalls.has(callId)) {
        activeCalls.get(callId).status = "accepted";
        activeCalls.get(callId).acceptedTime = Date.now();
      }
      
      io.to(targetSocketId).emit("call-accepted", {
        from,
        callId,
        timestamp: Date.now()
      });
    }
  });
  
  // Reject call
  socket.on("reject-call", (data) => {
    const { callId, from, to, reason = "busy" } = data;
    
    console.log(`❌ ${from} rejected call ${callId}: ${reason}`);
    
    const targetSocketId = getUserSocket(to);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-rejected", {
        from,
        callId,
        reason,
        timestamp: Date.now()
      });
    }
    
    // Cleanup
    activeCalls.delete(callId);
  });
  
  // End call
  socket.on("end-call", (data) => {
    const { callId, to, reason = "ended" } = data;
    
    console.log(`🔴 Call ended: ${callId} - ${reason}`);
    
    const targetSocketId = getUserSocket(to);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-ended", {
        callId,
        reason,
        timestamp: Date.now()
      });
    }
    
    // Cleanup
    activeCalls.delete(callId);
  });
  
  // WebRTC signaling events
  socket.on("offer", (data) => {
    const { to, offer, callId } = data;
    const targetSocketId = getUserSocket(to);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit("offer", {
        from: socketUsers.get(socket.id),
        offer,
        callId
      });
    }
  });
  
  socket.on("answer", (data) => {
    const { to, answer, callId } = data;
    const targetSocketId = getUserSocket(to);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit("answer", {
        from: socketUsers.get(socket.id),
        answer,
        callId
      });
    }
  });
  
  socket.on("ice-candidate", (data) => {
    const { to, candidate, callId } = data;
    const targetSocketId = getUserSocket(to);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", {
        from: socketUsers.get(socket.id),
        candidate,
        callId
      });
    }
  });
  
  // Status events
  socket.on("mute-status", (data) => {
    const { to, callId, muted } = data;
    const targetSocketId = getUserSocket(to);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit("remote-mute-status", {
        callId,
        muted
      });
    }
  });
  
  socket.on("speaking-status", (data) => {
    const { to, callId, isSpeaking } = data;
    const targetSocketId = getUserSocket(to);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit("remote-speaking-status", {
        callId,
        isSpeaking
      });
    }
  });
  
  // Chat during call
  socket.on("chat-message", (data) => {
    const { to, callId, ...message } = data;
    const targetSocketId = getUserSocket(to);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit("chat-message", {
        ...message,
        callId,
        timestamp: Date.now()
      });
    }
  });
  
  // Disconnect handler
  socket.on("disconnect", (reason) => {
    console.log(`🔴 Socket disconnected: ${socket.id} - ${reason}`);
    
    const userId = socketUsers.get(socket.id);
    
    if (userId) {
      userSockets.delete(userId);
      socketUsers.delete(socket.id);
      
      console.log(`🟠 User offline: ${userId}`);
      
      // Clean up typing status
      typingUsers.delete(userId);
      
      // Leave all chat rooms
      socket.rooms.forEach(room => {
        if (room !== socket.id) { // Skip default room
          leaveChatRoom(socket, room, userId);
        }
      });
      
      // Notify others about disconnection
      socket.broadcast.emit("user-disconnected", { userId });
      
      // End any active calls for this user
      for (const [callId, callData] of activeCalls.entries()) {
        if (callData.participants.includes(userId)) {
          const otherUser = callData.participants.find(id => id !== userId);
          const otherSocketId = getUserSocket(otherUser);
          
          if (otherSocketId) {
            io.to(otherSocketId).emit("call-ended", {
              callId,
              reason: "user-disconnected",
              disconnectedUser: userId
            });
          }
          
          activeCalls.delete(callId);
          console.log(`🔴 Ended call ${callId} due to user ${userId} disconnect`);
        }
      }
    }
  });
  
  // Error handler
  socket.on("error", (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });
});

// Regular cleanup of old data
setInterval(cleanupOldCalls, 60000); // Run every minute

/* =======================
   HEALTH CHECK
======================= */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    onlineUsers: userSockets.size,
    activeCalls: activeCalls.size,
    pendingCalls: pendingCalls.size,
    chatRooms: chatRooms.size,
    typingUsers: typingUsers.size
  });
});

// Socket status endpoint
app.get("/socket-status", (req, res) => {
  const users = Array.from(userSockets.entries()).map(([userId, socketId]) => ({
    userId,
    socketId,
    rooms: Array.from(io.sockets.adapter.sids.get(socketId) || [])
  }));
  
  res.json({
    totalConnections: io.engine.clientsCount,
    users: users,
    chatRooms: Array.from(chatRooms.entries()).map(([roomId, sockets]) => ({
      roomId,
      userCount: sockets.size
    }))
  });
});

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectionDb();
    console.log("✅ Database connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📡 WebSocket available at ws://localhost:${PORT}`);
      console.log(`🔍 Socket status: http://localhost:${PORT}/socket-status`);
    });
  } catch (err) {
    console.error("❌ Server failed:", err);
    process.exit(1);
  }
};

startServer();
