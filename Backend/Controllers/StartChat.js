import Message from "../Models/Message.js"
import Conversation from "../Models/Conversation.js"
import ChatRequest from "../models/ChatRequest.js";

export const sendMessage = async (req, res) => {
    const { senderId, receiverId, message } = req.body;

    // Check if request is accepted
    const request = await ChatRequest.findOne({
        $or: [
            { sender: senderId, receiver: receiverId, status: "accepted" },
            { sender: receiverId, receiver: senderId, status: "accepted" },
        ],
    });

    if (!request)
        return res.status(403).json({ message: "Chat not allowed until request accepted" });

    // Get or create conversation
    let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [senderId, receiverId],
        });
    }

    // Create message
    const newMessage = await Message.create({
        conversationId: conversation._id,
        sender: senderId,
        receiver: receiverId,
        message,
    });

    conversation.lastMessage = newMessage._id;
    await conversation.save();

    res.status(201).json(newMessage);
};
