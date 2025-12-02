import { isAuth } from "../Middleware/IsAuth.js";
import ChatRequest from "../Models/ChatstartRequest.js";
import Chat from "../Models/ChatRoom.js";
import mongoose from "mongoose";




// 🟢 GET INCOMING REQUESTS (requests sent *to* the logged-in user)



// 🟢 ACCEPT CHAT REQUEST (when receiver accepts the pending request)
export const acceptChatRequest = async (req, res) => {
  try {
    const { receiverId, senderId } = req.body;

    console.log("✅ Accepting request between:", senderId, "→", receiverId);

    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: "Both senderId and receiverId are required",
      });
    }

    // 🔍 Find the pending request between the users
    const request = await ChatRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "No pending request found between these users",
      });
    }

    // ✅ Update request status to accepted
    request.status = "accepted";
    request.updatedAt = new Date();
    await request.save();

    console.log("🎯 Request accepted successfully:", request._id);

    // 💬 Check or create chat room
    try {
      const existingChat = await Chat.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!existingChat) {
        const newChat = new Chat({
          participants: [senderId, receiverId],
          lastMessageAt: new Date(),
        });
        await newChat.save();
        console.log("💬 New chat room created:", newChat._id);
      } else {
        console.log("💬 Chat room already exists:", existingChat._id);
      }
    } catch (chatError) {
      console.error("⚠️ Chat creation error:", chatError);
    }

    // ✅ Response
    return res.status(200).json({
      success: true,
      message: "Request accepted successfully",
      status: "accepted",
      data: request,
    });

  } catch (error) {
    console.error("❌ Accept Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const cancelChatRequestByUser = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    console.log("🗑️ Cancelling request between:", senderId, "and", receiverId);

    // 🧩 Validation
    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: "Both senderId and receiverId are required",
      });
    }

    // 🔍 Find any request between these users (regardless of who sent it)
    const request = await ChatRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    console.log("📋 Found request to cancel:", request);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "No request found between these users",
      });
    }

    // ✅ Set status to "none" instead of deleting
    request.status = "none";
    request.updatedAt = new Date();
    await request.save();

    console.log("✅ Request status set to 'none':", request._id);

    res.status(200).json({
      success: true,
      message: "Request cancelled successfully. Status set to 'none'.",
      data: request
    });

  } catch (error) {
    console.error("❌ Cancel Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};





export const getIncomingRequests = async (req, res) => {
  try {
    const userId = req.params.id;
     console.log("this is user id" , userId)

    // Validate ID
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    console.log("📥 Fetching incoming requests for user:", userId);

    // Find all pending requests where this user is the receiver
    const requests = await ChatRequest.find({
      receiver: userId,
      status: "pending",
    })
      .populate("sender", "personalInfo email profilePhotos") // populate sender details
      .populate("receiver", "personalInfo email") // populate receiver details
      .sort({ createdAt: -1 }) // sort by latest first
      .lean();

    // console.log("📋 Raw populated requests:", requests);

    // Enhanced request list with full sender information
    const requestList = requests.map(req => {
      const sender = req.sender || {};
      const receiver = req.receiver || {};
      
      return {
        requestId: req._id,
        sender: {
          _id: sender._id,
          email: sender.email,
          personalInfo: sender.personalInfo || {},
          profilePhotos: sender.profilePhotos || []
        },
        receiver: {
          _id: receiver._id,
          email: receiver.email,
          personalInfo: receiver.personalInfo || {}
        },
        message: req.message || null,
        status: req.status,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt
      };
    });

    // console.log("🎯 Enhanced request list:", requestList);

    console.log(`📊 Found ${requests.length} pending requests.`);

    res.status(200).json({
      success: true,
      userId,
      total: requests.length,
      requests: requestList,
    });

  } catch (error) {
    console.error("❌ Error fetching incoming requests:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// 🟢 CANCEL SPECIFIC REQUEST (by request ID)  as a user cancel request
export const cancelChatRequest = async (req, res) => {
  try {
    const { receiverId, senderId } = req.body;

    if (!receiverId || !senderId) {
      return res.status(400).json({
        success: false,
        message: "receiverId and senderId are required",
      });
    }

    console.log("🗑️ Cancel Request | Sender:", senderId, "Receiver:", receiverId);

    // Find the pending chat request between these two users
    const request = await ChatRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ],
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "No pending request found between these users",
      });
    }

    // ✅ Update the request status instead of deleting
    request.status = "none";
    await request.save();

    console.log("✅ Request status updated to 'none'");

    return res.status(200).json({
      success: true,
      message: "Request cancelled successfully and status set to none",
      data: request,
    });

  } catch (error) {
    console.error("❌ Cancel Chat Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while cancelling request",
    });
  }
};


export const getConnectionStatus = async (req, res) => {
  try {


    const { receiverId, senderId } = req.query;     // very impo when hit get request with dtaa sent i body tak it as

    console.log(senderId);
    console.log(receiverId);
    console.log("Current User ID:", senderId, "Target User ID:", receiverId);

    if (!senderId || !receiverId) {
      return res.status(400).json({ success: false, message: "Both user IDs are required" });
    }

    // Find any request between the two users
    const request = await ChatRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    // If no request exists, default to "none"
    if (!request) {
      return res.json({ success: true, status: "none", requestId: null });
    }

    // Return the actual status stored in DB
    return res.json({
      success: true,
      status: request.status, // this will be "pending", "accepted", "rejected", or "none"
      requestId: request._id,
    });

  } catch (error) {
    console.error("Error checking connection:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 🟢 SEND CHAT REQUEST (Case 1 & 2 Logic)
export const sendChatRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const { receiverId } = req.body;

    console.log("this is sender", senderId);
    console.log("this sis reciverID", receiverId);

    // Validate: Can't send request to yourself
    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You can't send a request to yourself.",
      });
    }

    // Check for existing request between these users
    const existingRequest = await ChatRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    console.log("📊 Existing request found:", existingRequest);

    // CASE 1: No existing request - create new one
    if (!existingRequest) {
      const newRequest = new ChatRequest({
        sender: senderId,
        receiver: receiverId,
        status: "pending",
      });

      await newRequest.save();
      console.log("✅ New request created:", newRequest._id);

      return res.status(201).json({
        success: true,
        message: "Connection request sent successfully",
        data: newRequest,
      });
    }

    // CASE 2: Handle existing requests based on status
    const isCurrentUserSender = existingRequest.sender.toString() === senderId;

    switch (existingRequest.status) {
      case "pending":
        if (isCurrentUserSender) {
          return res.status(400).json({
            success: false,
            message: "You already sent a request to this user.",
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "This user already sent you a request. Please check your incoming requests.",
          });
        }

      case "accepted":
        return res.status(400).json({
          success: false,
          message: "You are already connected with this user.",
        });

      case "rejected":
      case "none":
        // If rejected or none, update to pending and change sender to current user
        existingRequest.status = "pending";
        existingRequest.sender = senderId;
        existingRequest.receiver = receiverId;
        existingRequest.createdAt = new Date();
        await existingRequest.save();

        console.log("🔄 Request reset to pending:", existingRequest._id);

        return res.status(200).json({
          success: true,
          message: "Connection request sent successfully",
          data: existingRequest,
        });

      default:
        return res.status(400).json({
          success: false,
          message: "Unexpected request state.",
        });
    }

  } catch (err) {
    console.error("❌ Send Request Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// 🟢 CANCEL REQUEST BY USER ID (Universal cancel - sets status to "none")  someone cancel the request



// GET CONNECTION STATUS - return the actual status from DB









// 🟢 GET OUTGOING REQUESTS (Your sent requests)
export const getOutgoingRequests = async (req, res) => {
  try {
    const userId = req.userId;

    console.log("📤 Fetching outgoing requests for user:", userId);

    const requests = await ChatRequest.find({
      sender: userId,
      status: "pending",
    }).populate("receiver", "personalInfo firstName lastName email gallery location");

    console.log("📤 Outgoing requests found:", requests.length);

    res.status(200).json({
      success: true,
      data: requests,
      count: requests.length
    });

  } catch (error) {
    console.error("❌ Get Outgoing Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch outgoing requests"
    });
  }
};

// ... (Keep your existing getFriends, getActiveConversations, etc. functions as they are)

export const getFriends = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID missing from request (make sure authentication is working)",
      });
    }

    console.log("📡 Fetching accepted friends for user:", userId);

    // 🧩 Find all accepted connections involving this user
    const requests = await ChatRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "accepted",
    })
      .populate(
        "sender",
        "personalInfo.firstName personalInfo.lastName email location gallery isActive lastActive createdAt"
      )
      .populate(
        "receiver",
        "personalInfo.firstName personalInfo.lastName email location gallery isActive lastActive createdAt"
      );

    console.log(`✅ Found ${requests.length} accepted connections.`);

    // 🧠 Extract "friends" — i.e., the other user in each accepted request
    const friends = requests.map((reqDoc) => {
      const isSender = reqDoc.sender._id.toString() === userId.toString();
      const friend = isSender ? reqDoc.receiver : reqDoc.sender;

      if (!friend) return null; // safety check

      return {
        _id: friend._id,
        firstName: friend.personalInfo?.firstName || "",
        lastName: friend.personalInfo?.lastName || "",
        email: friend.email || "",
        gallery: friend.gallery?.length ? friend.gallery[0] : null,
        location: friend.location || {},
        isActive: friend.isActive || false,
        lastActive: friend.lastActive || "Recently active",
        connectedAt: reqDoc.updatedAt, // friendship acceptance time
      };
    }).filter(Boolean); // remove nulls

    res.status(200).json({
      success: true,
      count: friends.length,
      friends,
    });
  } catch (error) {
    console.error("❌ Error fetching friends:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch friends list",
    });
  }
};




export const getFriendsWithConversations = async (req, res) => {
  try {
    const userId = req.params.id;

    console.log("📡 Fetching accepted friends with conversations for user:", userId);

    // 1️⃣ Find all accepted friend requests
    const requests = await ChatRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "accepted",
    })
      .populate("sender", "personalInfo firstName lastName email profilePhotos isActive lastSeen")
      .populate("receiver", "personalInfo firstName lastName email profilePhotos isActive lastSeen");

    if (!requests.length) {
      return res.status(200).json({ success: true, data: [], message: "No accepted friends found" });
    }

    // 2️⃣ Extract friends
    const friends = requests.map(reqItem => {
      const isSender = reqItem.sender._id.toString() === userId.toString();
      return isSender ? reqItem.receiver : reqItem.sender;
    });

    // 3️⃣ Check if these friends have an active chat with the user
    const friendsWithConversations = await Promise.all(
      friends.map(async (friend) => {
        // Find chat where both participants are involved
        const chat = await Chat.findOne({
          participants: { $all: [userId, friend._id] }
        });

        if (!chat) return null; // No chat exists

        // Get message count from the messages array in the chat document
        const messageCount = chat.messages ? chat.messages.length : 0;
        
        console.log("message count", messageCount);
        
        if (messageCount === 0) return null; // Chat exists but no messages

        // Get last message from the messages array
        const lastMessage = chat.messages && chat.messages.length > 0 
          ? chat.messages[chat.messages.length - 1] 
          : null;

        // Count unread messages (messages where readBy doesn't include userId)
        const unreadCount = chat.messages ? chat.messages.filter(message => 
          message.sender && 
          message.sender.toString() === friend._id.toString() && 
          (!message.readBy || !message.readBy.includes(userId))
        ).length : 0;

        return {
          friendId: friend._id,
          name: `${friend.personalInfo?.firstName} ${friend.personalInfo?.lastName}`,
          profilePhoto: friend.profilePhotos?.[0] || null,
          isOnline: friend.isActive,
          lastSeen: friend.lastSeen,
          chatId: chat._id,
          conversationCount: messageCount,
          lastMessage: lastMessage?.content || null,
          lastMessageAt: lastMessage?.timestamp || chat.lastMessageAt,
          unreadCount,
        };
      })
    );

    const filteredFriends = friendsWithConversations.filter(f => f !== null);

    res.status(200).json({
      success: true,
      data: filteredFriends
    });

  } catch (error) {
    console.error("❌ Error fetching friends with conversations:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



export const getFriendsWithNoConversation = async (req, res) => {
  try {
    const userId = req.params.id;

    console.log("📡 Fetching accepted friends for user:", userId);

    // 1️⃣ Find all accepted friend requests
    const requests = await ChatRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "accepted",
    })
      .populate("sender", "personalInfo firstName lastName email profilePhotos isActive lastSeen")
      .populate("receiver", "personalInfo firstName lastName email profilePhotos isActive lastSeen");

    if (!requests.length) {
      return res.status(200).json({ success: true, data: [], message: "No accepted friends found" });
    }

    // 2️⃣ Extract friends
    const friends = requests.map(reqItem => {
      const isSender = reqItem.sender._id.toString() === userId.toString();
      return isSender ? reqItem.receiver : reqItem.sender;
    });

    // 3️⃣ For each friend, check if there is an active conversation
    const friendsWithConversations = await Promise.all(
      friends.map(async (friend) => {
        const chat = await Chat.findOne({
          participants: { $all: [userId, friend._id] }
        });

        let lastMessage = null;
        let unreadCount = 0;

        if (chat) {
          lastMessage = await Chat.findOne({ chat: chat._id }).sort({ timestamp: -1 });
          unreadCount = await Chat.countDocuments({
            chat: chat._id,
            sender: friend._id,
            readBy: { $ne: userId }
          });
        }

        return {
          friendId: friend._id,
          name: `${friend.personalInfo?.firstName} ${friend.personalInfo?.lastName}`,
          profilePhoto: friend.profilePhotos?.[0] || null,
          isOnline: friend.isActive,
          lastSeen: friend.lastSeen,
          chatId: chat?._id || null,
          lastMessage: lastMessage ? lastMessage.content : null,
          unreadCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: friendsWithConversations
    });

  } catch (error) {
    console.error("❌ Error fetching friends with conversations:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
