import express from "express";
import { isAuth } from '../Middleware/IsAuth.js'
import { 
  acceptChatRequest, 
  cancelChatRequest, 
  cancelChatRequestByUser, 
  getConnectionStatus, 
  getFriends, 
  getFriendsWithConversations, 
  getFriendsWithNoConversation, 
  getIncomingRequestcount, 
  getOutgoingRequests, // Add this import
  sendChatRequest 
} from '../Controllers/SendChatRequest.js'
import { getChatMessages, getOrCreateChat, sendMessage } from "../Controllers/FriendsChat.js";

const ChatRoutes = express.Router();

// 🟢 CHAT REQUEST SYSTEM
ChatRoutes.post("/chat-request/send", isAuth, sendChatRequest);
ChatRoutes.get("/status", isAuth, getConnectionStatus);

// Request management
ChatRoutes.put("/accept", isAuth, acceptChatRequest); // Changed to PUT
ChatRoutes.put("/cancel-by-user", isAuth, cancelChatRequestByUser); // Changed to PUT
ChatRoutes.put("/cancel-request", isAuth, cancelChatRequest); // Changed parameter name and method

// Get requests

ChatRoutes.get('/requests/outgoing', isAuth, getOutgoingRequests); // New route


// 🟢 FRIENDS SYSTEM
ChatRoutes.get("/friends/:id", isAuth, getFriends);
ChatRoutes.get("/friends/with-conversations/:id", isAuth, getFriendsWithConversations);
ChatRoutes.get("/friends/no-conversations/:id", isAuth, getFriendsWithNoConversation);



// 🟢 MESSAGING SYSTEM
ChatRoutes.get("/chat/:userId", isAuth, getOrCreateChat);
ChatRoutes.post("/chat/:id/message", isAuth, sendMessage);
ChatRoutes.get("/chat/:id/messages", isAuth, getChatMessages);



ChatRoutes.get('/incoming/:id', isAuth,  getIncomingRequestcount );

export default ChatRoutes;
