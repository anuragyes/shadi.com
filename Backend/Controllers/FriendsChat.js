import Chat from "../Models/ChatRoom.js";
// Get or create chat between two users
export const getOrCreateChat = async (req, res) => {
  try {
    const { userId } = req.params; // The other user's ID
    // console.log("userID" , userId)
    const currentUserId = req.userId;
    // console.log("this is userID", currentUserId);

    // Find existing chat between these two users
    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, userId] }
    });

    if (chat) {
      //  console.log("yes");
    }
    // If no chat exists, create one
    if (!chat) {
      chat = new Chat({
        participants: [currentUserId, userId],
        messages: []
      });
      await chat.save();
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Send message
// export const sendMessage = async (req, res) => {
//   try {
//     const { chatId } = req.params.id;
//     const { message } = req.body;
//     const senderId = req.user._id;


//     console.log("this is chatID", chatId);
//     console.log("this is the message", message);
//     console.log("this is the sendId", senderId)

//     const chat = await Chat.findById(chatId);
//     if (!chat) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chat not found'
//       });
//     }

//     // Verify user is a participant in this chat
//     if (!chat.participants.includes(senderId)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to send messages in this chat'
//       });
//     }

//     const newMessage = {
//       sender: senderId,
//       message: message,
//       timestamp: new Date()
//     };

//     chat.messages.push(newMessage);
//     await chat.save();

//     // Populate sender info for the response
//     await chat.populate('messages.sender', 'personalInfo firstName lastName');

//     res.status(200).json({
//       success: true,
//       data: newMessage
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// Get chat messages
export const getChatMessages = async (req, res) => {
  try {
    const  chatId  = req.params.id;
    const currentUserId = req.userId;


      console.log( "this is chatID",chatId)
      console.log("this is currentid" , currentUserId)

    const chat = await Chat.findById(chatId)
      .populate('participants', 'personalInfo firstName lastName avatar isActive')
      .populate('messages.sender', 'personalInfo firstName lastName');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user is a participant
    if (!chat.participants.some(p => p._id.toString() === currentUserId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this chat'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        chat: chat,
        messages: chat.messages
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const sendMessage = async (req, res) => {
  try {
    const chatId = req.params.id; // fixed
    const { message } = req.body;
    const senderId = req.userId; // matches getOrCreateChat

    if (!senderId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    if (!chat.participants.includes(senderId)) {
      return res.status(403).json({ success: false, message: "Not authorized to send messages in this chat" });
    }

    const newMessage = { sender: senderId, message, timestamp: new Date() };

    chat.messages.push(newMessage);
    await chat.save();
    await chat.populate("messages.sender", "personalInfo firstName lastName");

    res.status(200).json({ success: true, data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Get user's all chats
export const getUserChats = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const chats = await Chat.find({
      participants: currentUserId
    })
      .populate('participants', 'personalInfo firstName lastName avatar isActive lastActive')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};