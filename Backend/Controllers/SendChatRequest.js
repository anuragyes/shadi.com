

import { isAuth } from "../Middleware/IsAuth.js";
import ChatRequest from "../Models/ChatstartRequest.js";
import Chat from "../Models/ChatRoom.js";

export const sendChatRequest = async (req, res) => {
  try {
    const senderId = req.userId;
    const { receiverId } = req.body;

    console.log("Sender ID:", senderId);
    console.log("Receiver ID:", receiverId);

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You can't send a request to yourself.",
      });
    }

    // 🔍 Check if any chat request already exists between these two users
    const existing = await ChatRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    // ✅ CASE 1: If no request exists, create a new one
    if (!existing) {
      const newRequest = new ChatRequest({
        sender: senderId,
        receiver: receiverId,
        status: "pending",
      });

      await newRequest.save();

      return res.status(201).json({
        success: true,
        message: "Friend request sent.",
        data: newRequest,
      });
    }

    // ✅ CASE 2: If request already exists
    console.log("Existing request status:", existing.status);

    // If pending and sent by the *other user*
    if (existing.status === "pending" && existing.sender.toString() === receiverId) {
      return res.status(400).json({
        success: false,
        message: "This user has already sent you a request. Please accept or reject it.",
      });
    }

    // If pending and sent by current user
    if (existing.status === "pending" && existing.sender.toString() === senderId) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request with this user.",
      });
    }

    // If rejected previously, allow resending
    if (existing.status === "rejected") {
      existing.status = "pending";
      existing.sender = senderId;
      existing.receiver = receiverId;
      existing.createdAt = new Date();
      await existing.save();

      return res.status(200).json({
        success: true,
        message: "Friend request sent again.",
        data: existing,
      });
    }

    // If already accepted
    if (existing.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "You are already connected with this user.",
      });
    }

    // Default fallback
    return res.status(400).json({
      success: false,
      message: "Unexpected request state.",
    });

  } catch (err) {
    console.error("Send Chat Request Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const rejectChatRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.userId;

    if (!requestId) {
      return res.status(400).json({ success: false, message: "Request ID is required" });
    }

    // Find the request and verify the current user is the receiver
    const request = await ChatRequest.findOne({
      _id: requestId,
      receiver: userId,
      status: "pending"
    });

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: "Request not found or you don't have permission to reject it" 
      });
    }

    // Update status to rejected
    request.status = "rejected";
    await request.save();

    res.status(200).json({ 
      success: true, 
      message: "Request rejected successfully" 
    });
  } catch (error) {
    console.error("Error rejecting request:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const cancelChatRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.userId;

    if (!requestId) {
      return res.status(400).json({ success: false, message: "Request ID is required" });
    }

    // Find the request and verify the current user is the sender
    const request = await ChatRequest.findOne({
      _id: requestId,
      sender: userId,
      status: "pending"
    });

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: "Request not found or you don't have permission to cancel it" 
      });
    }

    await ChatRequest.findByIdAndDelete(requestId);
    
    res.status(200).json({ 
      success: true, 
      message: "Request cancelled successfully" 
    });
  } catch (error) {
    console.error("Error cancelling request:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const acceptChatRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.userId;

    if (!requestId) {
      return res.status(400).json({ success: false, message: "Request ID is required" });
    }

    // Find the request and make sure the current user is the receiver
    const request = await ChatRequest.findOne({ 
      _id: requestId, 
      receiver: userId,
      status: "pending"
    });

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: "Request not found or you don't have permission to accept it" 
      });
    }

    // Update the request status to accepted
    request.status = "accepted";
    await request.save();

    // Create a chat room for the connected users
    try {
      const existingChat = await Chat.findOne({
        participants: { $all: [request.sender, request.receiver] }
      });

      if (!existingChat) {
        const newChat = new Chat({
          participants: [request.sender, request.receiver],
          lastMessageAt: new Date()
        });
        await newChat.save();
      }
    } catch (chatError) {
      console.error("Error creating chat room:", chatError);
      // Don't fail the request if chat creation fails
    }

    return res.status(200).json({ 
      success: true, 
      message: "Request accepted", 
      data: request 
    });
  } catch (error) {
    console.error("Error accepting request:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const cancelChatRequestByUser = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const otherUserId = req.params.userId;

    if (!otherUserId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Find the pending request where current user is involved
    const request = await ChatRequest.findOne({
      $or: [
        { sender: currentUserId, receiver: otherUserId, status: "pending" },
        { sender: otherUserId, receiver: currentUserId, status: "pending" }
      ]
    });

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: "No pending request found" 
      });
    }

    // Delete the request
    await ChatRequest.findByIdAndDelete(request._id);
    
    res.status(200).json({ 
      success: true, 
      message: "Request cancelled successfully" 
    });
  } catch (error) {
    console.error("Error cancelling request by user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/user/request/status/:userId
// GET /api/user/request/status/:userId - FIXED VERSION
export const getConnectionStatus = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.userId;

    console.log("🟣 Checking connection status:", { 
      currentUserId, 
      targetUserId 
    });

    // Find any existing request between these two users
    const existingRequest = await ChatRequest.findOne({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId },
      ],
    });

    if (!existingRequest) {
      console.log("🟣 No existing request found - status: none");
      return res.json({ 
        success: true, 
        status: "none",
        requestId: null 
      });
    }

    console.log("🟣 Found existing request:", {
      requestId: existingRequest._id,
      sender: existingRequest.sender.toString(),
      receiver: existingRequest.receiver.toString(),
      status: existingRequest.status,
      currentUserIsSender: existingRequest.sender.toString() === currentUserId
    });

    let connectionStatus;
    let requestId = null;

    // If current user is the SENDER of the request
    if (existingRequest.sender.toString() === currentUserId) {
      switch (existingRequest.status) {
        case "pending":
          connectionStatus = "pending";
          requestId = existingRequest._id;
          break;
        case "accepted":
          connectionStatus = "accepted";
          requestId = existingRequest._id;
          break;
        case "rejected":
          connectionStatus = "rejected";
          break;
        default:
          connectionStatus = "none";
      }
    } 
    // If current user is the RECEIVER of the request
    else {
      switch (existingRequest.status) {
        case "pending":
          // If someone sent request to current user, show "none" so they can send their own
          connectionStatus = "none";
          break;
        case "accepted":
          connectionStatus = "accepted";
          requestId = existingRequest._id;
          break;
        case "rejected":
          connectionStatus = "rejected";
          break;
        default:
          connectionStatus = "none";
      }
    }

    console.log("🟣 Returning connection status:", { 
      connectionStatus, 
      requestId,
      currentUserRole: existingRequest.sender.toString() === currentUserId ? "sender" : "receiver"
    });
    
    return res.json({
      success: true,
      status: connectionStatus,
      requestId: requestId,
    });
  } catch (err) {
    console.error("❌ Error fetching connection status:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Keep your other functions (getIncomingRequests, getFriends, etc.) the same
export const getIncomingRequests = async (req, res) => {
  try {
    const requests = await ChatRequest.find({
      receiver: req.userId,
      status: "pending",
    }).populate("sender", "personalInfo firstName lastName email gallery location");

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch requests" });
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
