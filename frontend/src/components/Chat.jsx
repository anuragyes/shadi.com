
import socket from "../Context/Socket.js";
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    Send,
    Phone,
    Video,
    MoreVertical,
    Paperclip,
    CheckCheck,
    Smile
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../Context/Authcontext.js';

const Chat = () => {

    const BASE_URL = "https://shadii-com.onrender.com"; // use production URL
    const { friendId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { currentuser } = useContext(AuthContext);
    const [friend, setFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [chatId, setChatId] = useState(null);
    const messagesEndRef = useRef(null);

    const friendName = location.state?.friendName || "Unknown";
    const MAX_MESSAGE_LENGTH = 200;

    // 🔹 SOCKET CONNECTION SETUP
    useEffect(() => {
        if (!currentuser?._id) return;

        socket.emit("userOnline", currentuser._id);
        socket.on("receiveMessage", (data) => {
            if (data.from === friendId) {
                setMessages((prev) => [
                    ...prev,
                    {
                        sender: data.from,
                        message: data.message,
                        timestamp: new Date().toISOString(),
                    },
                ]);
            }
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, [currentuser, friendId]);

    // 🔹 Initialize chat room
    const initRealChat = async () => {
        try {
            setLoading(true);

            const chatRes = await axios.get(
                `${BASE_URL}/api/user/request/chat/${friendId}`,
                { withCredentials: true }
            );

            if (chatRes.data.success) {
                const chatData = chatRes.data.data;
                setChatId(chatData._id);

                socket.emit("joinRoom", chatData._id);

                const otherParticipant = chatData.participants.find(
                    (p) => p._id !== currentuser._id
                );

                setFriend(otherParticipant);
                setIsOnline(otherParticipant?.isActive || false);

                const messagesRes = await axios.get(
                    `${BASE_URL}/api/user/request/chat/${chatData._id}/messages`,
                    { withCredentials: true }
                );

                if (messagesRes.data.success) {
                    setMessages(messagesRes.data.data.messages || []);
                }
            }
        } catch (error) {
            console.error("Error initializing chat:", error);

            if (error.response?.status === 403) {
                toast.error("You need to be connected to message this user");
                navigate("/matches");
                return;
            }

            toast.error("Failed to load chat");

            try {
                const userRes = await axios.get(
                    `${BASE_URL}/api/user/${friendId}`,
                    { withCredentials: true }
                );
                if (userRes.data.success)
                    setFriend(userRes.data.data.user);
            } catch (userError) {
                console.error("Could not load user info:", userError);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (friendId && currentuser) {
            initRealChat();
        }
    }, [friendId, currentuser]);

    // 🔹 Scroll to bottom whenever messages update
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    // 🔹 Send message
    const sendRealMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !chatId) return;

        const messageText = newMessage.trim();

        const tempMessage = {
            _id: `temp-${Date.now()}`,
            message: messageText,
            sender: currentuser._id,
            timestamp: new Date().toISOString(),
            isTemp: true,
        };

        setMessages((prev) => [...prev, tempMessage]);
        setNewMessage("");

        try {
            const res = await axios.post(
                `${BASE_URL}/api/user/request/chat/${chatId}/message`,
                { message: messageText },
                { withCredentials: true }
            );

            if (res.data.success) {
                const savedMessage = res.data.data;

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === tempMessage._id
                            ? { ...savedMessage, isTemp: false }
                            : msg
                    )
                );

                socket.emit("sendMessage", {
                    from: currentuser._id,
                    to: friendId,
                    message: messageText,
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");

            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === tempMessage._id
                        ? { ...msg, failed: true, isTemp: false }
                        : msg
                )
            );
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendRealMessage(e);
        }
    };

    const formatTime = (timestamp) =>
        new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    const isMyMessage = (senderId) => senderId === currentuser?._id;

    // Group messages by date
    const groupMessagesByDate = () => {
        const groups = {};
        messages.forEach(message => {
            const date = formatDate(message.timestamp);
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
        });
        return groups;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading conversation...</p>
                </div>
            </div>
        );
    }

    const messageGroups = groupMessagesByDate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col">
            {/* Header - Fixed */}
            <div className="bg-white/5 backdrop-blur-lg border-b border-white/10 sticky top-0 z-20 shadow-lg">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors lg:hidden"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-300" />
                            </button>

                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-linear-to-rfrom-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                        {friend?.personalInfo?.firstName?.charAt(0) || 'U'}
                                    </div>
                                    <div className={`absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-white text-lg">{friendName}</h2>
                                    <p className="text-gray-400 text-sm">
                                        {isOnline ? 'Online' : `Last seen ${Math.floor(Math.random() * 60) + 1} minutes ago`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <Phone className="w-5 h-5 text-gray-300" />
                            </button>
                            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <Video className="w-5 h-5 text-gray-300" />
                            </button>
                            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <MoreVertical className="w-5 h-5 text-gray-300" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full px-4 py-2">
                <div className="flex flex-col space-y-1">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-center flex-1 min-h-[50vh]">
                            <div>
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send className="w-6 h-6 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">Start the Conversation!</h3>
                                <p className="text-gray-400">You matched with {friend?.personalInfo?.firstName}. Say hi!</p>
                            </div>
                        </div>
                    ) : (
                        Object.entries(messageGroups).map(([date, dateMessages]) => (
                            <div key={date}>
                                {/* Date Separator */}
                                <div className="flex justify-center my-6">
                                    <div className="bg-white/10 px-3 py-1 rounded-full">
                                        <span className="text-gray-400 text-xs font-medium">{date}</span>
                                    </div>
                                </div>

                                {/* Messages for this date */}
                                {dateMessages.map((message, index) => {
                                    const sentByMe = isMyMessage(message.sender);
                                    const showAvatar = !sentByMe && (
                                        index === dateMessages.length - 1 ||
                                        dateMessages[index + 1]?.sender !== message.sender
                                    );

                                    return (
                                        <div
                                            key={message._id}
                                            className={`flex ${sentByMe ? 'justify-end' : 'justify-start'} mb-1`}
                                        >
                                            <div className={`max-w-[85%] lg:max-w-[70%] flex ${sentByMe ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                                                {/* Avatar for friend's messages */}
                                                {!sentByMe && (
                                                    <div className={`w-6 h-6 flex-shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}>
                                                        {showAvatar && (
                                                            <div className="w-6 h-6 bg-linear-to-rfrom-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                                {friend?.personalInfo?.firstName?.charAt(0) || 'F'}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Message Bubble */}
                                                <div className={`px-4 py-2 rounded-2xl ${sentByMe
                                                    ? message.failed
                                                        ? 'bg-red-500/20 border border-red-500'
                                                        : 'bg-blue-500 text-white'
                                                    : 'bg-gray-700/80 text-gray-100 border border-gray-600/30'
                                                    } ${message.isTemp ? 'opacity-70 animate-pulse' : ''}`}>
                                                    <p className="text-sm break-words leading-relaxed">
                                                        {message.message}
                                                    </p>
                                                    <div className={`flex items-center space-x-1 mt-1 ${sentByMe ? 'justify-end' : 'justify-start'
                                                        }`}>
                                                        <span className={`text-xs ${sentByMe ? 'text-blue-100' : 'text-gray-400'
                                                            }`}>
                                                            {formatTime(message.timestamp)}
                                                        </span>
                                                        {sentByMe && (
                                                            <>
                                                                {message.failed ? (
                                                                    <span className="text-xs text-red-300 font-bold">!</span>
                                                                ) : message.read ? (
                                                                    <CheckCheck className="w-3 h-3 text-blue-100" />
                                                                ) : message.isTemp ? (
                                                                    <span className="w-2 h-2 rounded-full bg-blue-100 animate-ping"></span>
                                                                ) : (
                                                                    <CheckCheck className="w-3 h-3 text-blue-100 opacity-70" />
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {/* Typing Indicator */}
            {isTyping && (
                <div className="max-w-4xl mx-auto w-full px-4 py-1">
                    <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        <div className="w-6 h-6 bg-linear-to-rfrom-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {friend?.personalInfo?.firstName?.charAt(0) || 'F'}
                        </div>
                        <span>{friend?.personalInfo?.firstName || 'Friend'} is typing...</span>
                    </div>
                </div>
            )}

            {/* Message Input - Fixed at bottom */}
            <div className="sticky bottom-0 z-10 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pt-4 pb-2">
                <div className="max-w-4xl mx-auto w-full px-4">
                    {/* Character Counter */}
                    <div className="flex justify-between items-center mb-2 px-2">
                        <span className="text-gray-400 text-xs">
                            {isTyping ? `${friend?.personalInfo?.firstName || 'Friend'} is typing...` : 'Start Typing...'}
                        </span>
                        <span className={`text-xs ${newMessage.length > MAX_MESSAGE_LENGTH ? 'text-red-400' : 'text-gray-400'
                            }`}>
                            {newMessage.length}/{MAX_MESSAGE_LENGTH}
                        </span>
                    </div>

                    {/* Input Area */}
                    <form onSubmit={sendRealMessage} className="flex items-end space-x-2 bg-white/5 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-white/10">
                        <button type="button" className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
                            <Paperclip className="w-5 h-5 text-gray-300" />
                        </button>

                        <div className="flex-1 relative">
                            <textarea
                                value={newMessage}
                                onChange={(e) => {
                                    if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                                        setNewMessage(e.target.value);
                                    }
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        sendRealMessage(e);
                                    }
                                }}
                                placeholder="Type a message..."
                                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-white placeholder-gray-400 py-1 px-2 text-sm resize-none min-h-[20px] max-h-[120px]"
                                disabled={!chatId}
                                rows="1"
                                style={{
                                    height: 'auto',
                                    minHeight: '20px'
                                }}
                            />
                        </div>

                        <button type="button" className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
                            <Smile className="w-5 h-5 text-gray-300" />
                        </button>

                        <button
                            type="submit"
                            disabled={!newMessage.trim() || !chatId || newMessage.length > MAX_MESSAGE_LENGTH}
                            className={`p-3 rounded-full transition-all flex-shrink-0 ${newMessage.trim() && chatId && newMessage.length <= MAX_MESSAGE_LENGTH
                                ? 'bg-linear-to-rfrom-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                                : 'bg-white/10 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>

                    {!chatId && (
                        <div className="text-center mt-2">
                            <p className="text-yellow-400 text-xs">
                                ⚠️ Chat not initialized. Please ensure you are connected with this user.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
