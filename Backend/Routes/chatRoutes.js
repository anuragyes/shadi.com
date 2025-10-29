import express from "express";
import { isAuth } from '../Middleware/IsAuth.js'

import { acceptChatRequest, getConnectionStatus, getFriends, getFriendsWithConversations, getFriendsWithNoConversation, getIncomingRequests, rejectChatRequest, sendChatRequest } from '../Controllers/SendChatRequest.js'
import { getChatMessages, getOrCreateChat, sendMessage } from "../Controllers/FriendsChat.js";


const ChatRoutes = express.Router();

// Chat request system
ChatRoutes.post("/chat-request/send", isAuth, sendChatRequest);
ChatRoutes.post("/:id/accept", isAuth, acceptChatRequest);
ChatRoutes.post("/:id/reject", isAuth, rejectChatRequest);



// messaging start 
ChatRoutes.post("/chat/:id/message", isAuth, sendMessage)
ChatRoutes.get("/chat/:id/messages", isAuth, getChatMessages)


// routes/ChatRoutes.js
ChatRoutes.get("/status/:userId", isAuth, getConnectionStatus);
//   get chat user with conversation withcovert not allowed 
ChatRoutes.get("/chat-friends", isAuth, getFriendsWithConversations);
ChatRoutes.get("/chat/-NoMessage", isAuth, getFriendsWithNoConversation);
// ✅ Get all connected friends
ChatRoutes.get("/friends", isAuth, getFriends);

//  get how many reques  comes 
ChatRoutes.get('/getrequest', isAuth, getIncomingRequests);



ChatRoutes.get("/chat/:userId", isAuth, getOrCreateChat); // Get or create chat with specific user


export default ChatRoutes;
