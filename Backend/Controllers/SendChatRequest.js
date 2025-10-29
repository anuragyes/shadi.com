import { isAuth } from "../Middleware/IsAuth.js";
import ChatRequest from "../Models/ChatstartRequest.js";
import User from '../Models/UserModel.js'
import Chat from "../Models/ChatRoom.js";



export const sendChatRequest = async (req, res) => {
  try {
    const senderId = req.userId; // <-- fix here
    const { receiverId } = req.body;

    // console.log("Sender ID:", senderId);
    // console.log("Receiver ID:", receiverId);

    if (senderId === receiverId) {
      return res.status(400).json({ success: false, message: "You can't send a request to yourself." });
    }

    const existing = await ChatRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Request already ${existing.status === "pending" ? "sent" : existing.status}`,
      });
    }

    const newRequest = new ChatRequest({ sender: senderId, receiver: receiverId });
    await newRequest.save();

    return res.status(201).json({ success: true, message: "Friend request sent.", data: newRequest });
  } catch (err) {
    console.error("Send Chat Request Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const rejectChatRequest = async (req, res) => {
  const requestId = req.params.id;
  if (!requestId) {
    return res.status(400).json({ success: false, message: "Request ID is required" });
  }
  const request = await ChatRequest.findById(requestId);
  if (!request) return res.status(404).json({ message: "Request not found" });

  // console.log(request);
  request.status = "rejected";
  await request.save();

  res.status(200).json({ message: "Request rejected" });
};


export const acceptChatRequest = async (req, res) => {
  try {
    const requestId = req.params.id; // Must match the route param; // ID of the ChatRequest

    if (!requestId) {
      return res.status(400).json({ success: false, message: "Request ID is required" });
    }

    // Find the request and make sure the current user is the receiver
    const request = await ChatRequest.findOne({ _id: requestId, receiver: req.userId });

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    // Update the request status to accepted
    request.status = "accepted";
    await request.save();

    return res.status(200).json({ success: true, message: "Request accepted", data: request });
  } catch (error) {
    console.error("Error accepting request:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const getIncomingRequests = async (req, res) => {
  try {
    const requests = await ChatRequest.find({
      receiver: req.userId,
      status: "pending",
    }).populate("sender", "personalInfo email"); // Get sender info



    // console.log("this is backend function to get req" , requests);
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch requests" });
  }
};




export const getConnectionStatus = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const otherUserId = req.params.userId;

    const request = await ChatRequest.findOne({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    });

    if (!request) {
      return res.status(200).json({ success: true, status: "none" });
    }

    return res.status(200).json({ success: true, status: request.status });
  } catch (error) {
    console.error("Error fetching connection status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getFriends = async (req, res) => {
  try {
    const userId = req.userId;

    // 🧩 Find all accepted requests where user is either sender or receiver
    const requests = await ChatRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "accepted",
    })
      .populate("sender", "personalInfo.firstName personalInfo.lastName email location gallery isActive lastActive createdAt")
      .populate("receiver", "personalInfo.firstName personalInfo.lastName email location gallery isActive lastActive createdAt");

    // 🧠 Extract the other user (friend)
    const friends = requests.map((req) => {
      const isSender = req.sender._id.toString() === userId.toString();
      const friend = isSender ? req.receiver : req.sender;

      return {
        _id: friend._id,
        firstName: friend.personalInfo?.firstName || "",
        lastName: friend.personalInfo?.lastName || "",
        email: friend.email,
        gallery: friend.gallery,
        location: friend.location,
        isActive: friend.isActive,
        lastActive: friend.lastActive,
        createdAt: req.createdAt, // friendship date
      };
    });

    res.status(200).json({
      success: true,
      data: friends,
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch connected users",
    });
  }
};


export const getActiveConversations = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 20 } = req.query;

        const skip = (page - 1) * limit;

        // Find chats with messages, sorted by most recent activity
        const chats = await ChatRequest.find({ participants: userId })
            .populate('participants', 'personalInfo firstName lastName profilePhotos isActive lastSeen')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Filter chats that have messages and format response
        const conversations = await Promise.all(
            chats.map(async (chat) => {
                const messageCount = await Message.countDocuments({ chat: chat._id });
                
                if (messageCount === 0) {
                    return null;
                }

                const otherParticipant = chat.participants.find(
                    participant => participant._id.toString() !== userId.toString()
                );

                if (!otherParticipant) {
                    return null;
                }

                const lastMessage = await Message.findOne({ chat: chat._id })
                    .sort({ timestamp: -1 })
                    .populate('sender', 'personalInfo firstName lastName');

                const unreadCount = await Message.countDocuments({
                    chat: chat._id,
                    sender: otherParticipant._id,
                    readBy: { $ne: userId }
                });

                return {
                    friendId: otherParticipant._id,
                    chatId: chat._id,
                    friendName: `${otherParticipant.personalInfo?.firstName} ${otherParticipant.personalInfo?.lastName}`,
                    firstName: otherParticipant.personalInfo?.firstName,
                    lastName: otherParticipant.personalInfo?.lastName,
                    profilePhoto: otherParticipant.profilePhotos?.[0],
                    isOnline: otherParticipant.isActive,
                    lastSeen: otherParticipant.lastSeen,
                    lastMessage: lastMessage ? {
                        content: lastMessage.content,
                        timestamp: lastMessage.timestamp,
                        isFromMe: lastMessage.sender._id.toString() === userId.toString()
                    } : null,
                    unreadCount,
                    updatedAt: chat.updatedAt
                };
            })
        );

        const filteredConversations = conversations.filter(conv => conv !== null);
        const totalConversations = await Chat.countDocuments({ 
            participants: userId,
            _id: {
                $in: await Message.distinct('chat', {})
            }
        });

        return res.status(200).json({
            success: true,
            data: {
                conversations: filteredConversations,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalConversations / limit),
                    totalConversations,
                    hasNext: (page * limit) < totalConversations,
                    hasPrev: page > 1
                }
            },
            message: 'Active conversations retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting active conversations:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


export const getFriendsWithConversations = async (req, res) => {
    try {
        const userId = req.userId;

        // Find all chats where user is a participant and has messages
        const chats = await Chat.find({ 
            participants: userId,
            messages: { $exists: true, $not: { $size: 0 } }
        })
        .populate('participants', 'personalInfo profilePhotos isActive lastSeen')
        .sort({ lastMessageAt: -1 });

        // console.log("Total chats with messages found:", chats.length);

        // Process each chat
        const friendsWithConversations = chats.map((chat) => {
            // Find the other participant (friend)
            const otherParticipant = chat.participants.find(
                participant => participant._id.toString() !== userId.toString()
            );

            if (!otherParticipant) {
                console.log("No other participant found for chat:", chat._id);
                return null;
            }

            // Get the last message from the messages array
            const lastMessage = chat.messages && chat.messages.length > 0 
                ? chat.messages[chat.messages.length - 1]
                : null;

            // Calculate unread count with proper null checks
            const unreadCount = chat.messages ? chat.messages.filter(message => {
                // Check if message exists and has required fields
                if (!message || !message.sender) return false;
                
                const isFromOtherUser = message.sender.toString() !== userId.toString();
                const isUnread = !message.readBy || !message.readBy.includes(userId);
                
                return isFromOtherUser && isUnread;
            }).length : 0;

            // Build last message object with proper null checks
            let lastMessageObj = null;
            if (lastMessage) {
                lastMessageObj = {
                    _id: lastMessage._id || chat._id,
                    message: lastMessage.content || chat.lastMessage || "No message content",
                    sender: lastMessage.sender,
                    isSentByMe: lastMessage.sender && lastMessage.sender.toString() === userId.toString(),
                    timestamp: lastMessage.timestamp || chat.lastMessageAt || chat.updatedAt,
                    read: lastMessage.readBy ? lastMessage.readBy.includes(userId) : false
                };
            }

            return {
                _id: otherParticipant._id,
                chatId: chat._id,
                personalInfo: {
                    firstName: otherParticipant.personalInfo?.firstName || 'User',
                    lastName: otherParticipant.personalInfo?.lastName || '',
                    fullName: `${otherParticipant.personalInfo?.firstName || 'User'} ${otherParticipant.personalInfo?.lastName || ''}`.trim()
                },
                profilePhotos: otherParticipant.profilePhotos || [],
                isActive: otherParticipant.isActive || false,
                lastSeen: otherParticipant.lastSeen,
                lastMessage: lastMessageObj,
                unreadCount,
                lastInteraction: chat.lastMessageAt || chat.updatedAt
            };
        });

        // Remove null values
        const filteredFriends = friendsWithConversations.filter(friend => friend !== null);

        // console.log("Friends with conversations:", filteredFriends.length);

        return res.status(200).json({
            success: true,
            data: {
                friends: filteredFriends,
                totalConversations: filteredFriends.length
            },
            message: 'Friends with conversations retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting friends with conversations:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};




export const getFriendsWithNoConversation = async (req, res) => {
    try {
        const userId = req.userId;

        // 1. Get all chats where current user is a participant AND messages array is empty
        const chatsWithNoMessages = await Chat.find({
            participants: userId,
            $or: [
                { messages: { $exists: false } },
                { messages: { $size: 0 } }
            ]
        }).populate('participants', 'personalInfo profilePhotos isActive lastSeen');

        // 2. Extract the friend/other participant in each chat
        const friendsWithoutConversation = chatsWithNoMessages.map(chat => {
            const otherParticipant = chat.participants.find(p => p._id.toString() !== userId.toString());
            if (!otherParticipant) return null;

            return {
                _id: otherParticipant._id,
                chatId: chat._id,
                personalInfo: {
                    firstName: otherParticipant.personalInfo?.firstName || 'User',
                    lastName: otherParticipant.personalInfo?.lastName || '',
                    fullName: `${otherParticipant.personalInfo?.firstName || 'User'} ${otherParticipant.personalInfo?.lastName || ''}`.trim()
                },
                profilePhotos: otherParticipant.profilePhotos || [],
                isActive: otherParticipant.isActive || false,
                lastSeen: otherParticipant.lastSeen
            };
        }).filter(f => f !== null); // remove nulls just in case

        return res.status(200).json({
            success: true,
            data: {
                friends: friendsWithoutConversation,
                total: friendsWithoutConversation.length
            },
            message: 'Friends with no messages retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting friends with no conversation:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
