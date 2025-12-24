
import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    Send,
    Phone,
    Video,
    MoreVertical,
    Paperclip,
    CheckCheck,
    Smile,
    RefreshCw
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../Context/Authcontext.js';
import socketService from "../Sockets/SocketService.js"

const Chat = () => {
    const BASE_URL = "https://shadii-com.onrender.com";
    const { friendId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { currentuser } = useContext(AuthContext);
    
    // State variables
    const [friend, setFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [socketConnected, setSocketConnected] = useState(false);
    
    // Refs
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);
    const socketRef = useRef(null);
    const hasInitializedRef = useRef(false);
    const initChatAttemptedRef = useRef(false);

    const friendName = location.state?.friendName || "Unknown";
    const MAX_MESSAGE_LENGTH = 2000;

    // 🔹 Initialize Socket Connection
    useEffect(() => {
        const initializeSocket = async () => {
            if (!currentuser?.id || socketRef.current) return;

            try {
                console.log('🔌 Initializing socket for user:', currentuser.id);
                socketRef.current = await socketService.connect(currentuser.id);
                setSocketConnected(true);
                
                console.log('✅ Socket connected successfully');
                
                setupSocketListeners();
                
            } catch (error) {
                console.error('❌ Failed to connect socket:', error);
                setSocketConnected(false);
            }
        };

        initializeSocket();

        return () => {
            removeSocketListeners();
            if (socketRef.current && chatId) {
                socketRef.current.emit("leaveRoom", chatId);
            }
        };
    }, [currentuser?.id]);

    // 🔹 Setup Socket Listeners
    const setupSocketListeners = () => {
        if (!socketRef.current) return;

        console.log('🔧 Setting up socket listeners');

        const handleNewMessage = (data) => {
            console.log('📩 New message received:', data);
            handleIncomingMessage(data);
        };

        const handleTyping = (data) => {
            if (data.from === friendId) {
                setIsTyping(data.isTyping);
                
                if (data.isTyping) {
                    clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => {
                        setIsTyping(false);
                    }, 3000);
                } else {
                    setIsTyping(false);
                }
            }
        };

        const handleMessageSent = (data) => {
            console.log('✅ Message sent confirmation:', data);
            setMessages(prev => prev.map(msg => 
                msg.isTemp && msg.message === data.message 
                    ? { ...msg, isTemp: false, _id: data.messageId || msg._id }
                    : msg
            ));
        };

        const handleConnect = () => {
            console.log('🟢 Socket connected');
            setSocketConnected(true);
            if (chatId && socketRef.current) {
                socketRef.current.emit("joinRoom", chatId);
            }
        };

        const handleDisconnect = () => {
            console.log('🔴 Socket disconnected');
            setSocketConnected(false);
        };

        // Attach listeners
        socketRef.current.on("newMessage", handleNewMessage);
        socketRef.current.on("typing", handleTyping);
        socketRef.current.on("messageSent", handleMessageSent);
        socketRef.current.on("connect", handleConnect);
        socketRef.current.on("disconnect", handleDisconnect);

        // Store for cleanup
        socketRef.current._chatListeners = {
            newMessage: handleNewMessage,
            typing: handleTyping,
            messageSent: handleMessageSent,
            connect: handleConnect,
            disconnect: handleDisconnect
        };
    };

    // 🔹 Remove Socket Listeners
    const removeSocketListeners = () => {
        if (!socketRef.current || !socketRef.current._chatListeners) return;

        const listeners = socketRef.current._chatListeners;
        socketRef.current.off("newMessage", listeners.newMessage);
        socketRef.current.off("typing", listeners.typing);
        socketRef.current.off("messageSent", listeners.messageSent);
        socketRef.current.off("connect", listeners.connect);
        socketRef.current.off("disconnect", listeners.disconnect);
        
        delete socketRef.current._chatListeners;
    };

    // 🔹 Handle incoming messages - FIXED for object sender
    const handleIncomingMessage = useCallback((data) => {
        if (!data.from || !data.message) return;
        
        // Extract sender ID whether it's an object or string
        let senderId = data.from;
        if (typeof data.from === 'object' && data.from._id) {
            senderId = data.from._id; // Extract ID from object
        }

        const isFromFriend = senderId === friendId;
        const isInOurChatRoom = data.roomId === chatId;
        
        if (!isFromFriend && !isInOurChatRoom) return;

        const newMsg = {
            _id: data._id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sender: senderId, // Store as string ID
            senderObject: typeof data.from === 'object' ? data.from : null, // Keep object for reference
            message: data.message,
            timestamp: data.timestamp || new Date().toISOString(),
            read: senderId === currentuser?.id,
            type: data.type || 'text',
        };

        setMessages(prev => {
            const exists = prev.some(msg => 
                msg._id === newMsg._id || 
                (msg.sender === newMsg.sender && 
                 msg.message === newMsg.message && 
                 Math.abs(new Date(msg.timestamp) - new Date(newMsg.timestamp)) < 1000)
            );
            
            return exists ? prev : [...prev, newMsg];
        });
    }, [friendId, chatId, currentuser?.id]);

    // 🔹 Initialize chat room - FIXED for object sender
    const initRealChat = useCallback(async () => {
        if (initChatAttemptedRef.current || !friendId || !currentuser?.id) {
            return;
        }
        
        initChatAttemptedRef.current = true;
        console.log('🔄 Starting chat initialization...');

        try {
            setLoading(true);

            // Get or create chat
            const chatRes = await axios.get(
                `${BASE_URL}/api/user/request/chat/${friendId}`,
                { withCredentials: true }
            );

            if (chatRes.data.success) {
                const chatData = chatRes.data.data;
                setChatId(chatData._id);
                console.log('✅ Chat initialized with ID:', chatData._id);

                // Join socket room
                if (socketRef.current?.connected) {
                    socketRef.current.emit("joinRoom", chatData._id);
                    console.log('👤 Joined chat room:', chatData._id);
                }

                // Get friend info
                const otherParticipant = chatData.participants?.find(
                    p => p._id !== currentuser.id
                );

                if (otherParticipant) {
                    setFriend(otherParticipant);
                    setIsOnline(otherParticipant?.isActive || false);
                    console.log('👤 Friend info loaded:', otherParticipant.personalInfo?.firstName);
                }

                // Fetch messages
                const messagesRes = await axios.get(
                    `${BASE_URL}/api/user/request/chat/${chatData._id}/messages`,
                    { withCredentials: true }
                );

                if (messagesRes.data.success) {
                    const fetchedMessages = messagesRes.data.data.messages || [];
                    
                    console.log('📥 Raw messages from API:', fetchedMessages.map(m => ({
                        id: m._id,
                        sender: m.sender,
                        senderType: typeof m.sender,
                        senderId: m.sender?._id,
                        message: m.message?.substring(0, 50)
                    })));
                    
                    // Process messages - handle both object and string sender
                    const processedMessages = fetchedMessages.map(msg => {
                        // Extract sender ID properly
                        let senderId = msg.sender;
                        let senderObject = null;
                        
                        if (typeof msg.sender === 'object' && msg.sender._id) {
                            senderId = msg.sender._id; // Extract ID from object
                            senderObject = msg.sender; // Keep object for reference
                        }
                        
                        const isMyMsg = String(senderId) === String(currentuser.id);
                        
                        return {
                            ...msg,
                            sender: senderId, // Store as string ID
                            senderObject: senderObject, // Keep original object
                            read: isMyMsg ? msg.read : true
                        };
                    });
                    
                    setMessages(processedMessages);
                    console.log(`📥 Processed ${processedMessages.length} messages`);
                    
                    // Debug: Check first message
                    if (processedMessages.length > 0) {
                        const firstMsg = processedMessages[0];
                        console.log('🔍 First message debug:', {
                            originalSender: fetchedMessages[0]?.sender,
                            processedSender: firstMsg.sender,
                            currentUserId: currentuser.id,
                            isMyMessage: String(firstMsg.sender) === String(currentuser.id)
                        });
                    }
                }

                hasInitializedRef.current = true;
            }
        } catch (error) {
            console.error("❌ Error initializing chat:", error);
            initChatAttemptedRef.current = false;
            
            if (error.response?.status === 403) {
                toast.error("You need to be connected to message this user");
                navigate("/matches");
                return;
            }

            if (error.response?.status === 404) {
                toast.error("Chat not found. Please connect with this user first.");
                navigate("/matches");
                return;
            }

            toast.error("Failed to load chat");
        } finally {
            setLoading(false);
        }
    }, [friendId, currentuser, navigate]);

    // 🔹 Initialize chat ONCE
    useEffect(() => {
        if (friendId && currentuser?.id && !hasInitializedRef.current) {
            console.log('🚀 Initializing chat for friend:', friendId);
            initRealChat();
        }
        
        return () => {
            if (hasInitializedRef.current) {
                hasInitializedRef.current = false;
                initChatAttemptedRef.current = false;
            }
        };
    }, [friendId, currentuser?.id, initRealChat]);

    // 🔹 Join room on socket reconnection
    useEffect(() => {
        if (socketConnected && chatId && socketRef.current) {
            console.log('🔄 Re-joining chat room after reconnection:', chatId);
            socketRef.current.emit("joinRoom", chatId);
        }
    }, [socketConnected, chatId]);

    // 🔹 Scroll to bottom
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ 
                    behavior: "smooth",
                    block: "end"
                });
            }, 100);
        }
    }, [messages]);

    // 🔹 Handle typing indicator
    const handleTypingIndicator = useCallback((isTyping) => {
        if (!socketRef.current?.connected || !friendId || !chatId) return;

        clearTimeout(typingTimeoutRef.current);

        if (isTyping) {
            socketRef.current.emit("typing", {
                to: friendId,
                roomId: chatId,
                isTyping: true
            });
            
            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current.emit("typing", {
                    to: friendId,
                    roomId: chatId,
                    isTyping: false
                });
                setIsTyping(false);
            }, 3000);
        } else {
            socketRef.current.emit("typing", {
                to: friendId,
                roomId: chatId,
                isTyping: false
            });
        }
    }, [friendId, chatId]);

    // 🔹 Send message
    const sendRealMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim()) {
            toast.error("Message cannot be empty");
            return;
        }
        
        if (!chatId) {
            toast.error("Chat not initialized");
            return;
        }
        
        if (!socketRef.current?.connected) {
            toast.error("Not connected to chat server");
            return;
        }

        const messageText = newMessage.trim();

        // Create temporary message
        const tempMessage = {
            _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            message: messageText,
            sender: currentuser.id, // Store as string
            timestamp: new Date().toISOString(),
            isTemp: true,
            read: false,
            type: 'text'
        };

        setMessages(prev => [...prev, tempMessage]);
        setNewMessage("");
        
        handleTypingIndicator(false);

        try {
            const res = await axios.post(
                `${BASE_URL}/api/user/request/chat/${chatId}/message`,
                { message: messageText },
                { withCredentials: true }
            );

            if (res.data.success) {
                const savedMessage = res.data.data;
                
                // Extract sender ID from saved message
                let savedSenderId = savedMessage.sender;
                let savedSenderObject = null;
                
                if (typeof savedMessage.sender === 'object' && savedMessage.sender._id) {
                    savedSenderId = savedMessage.sender._id;
                    savedSenderObject = savedMessage.sender;
                }

                // Update temporary message
                setMessages(prev =>
                    prev.map(msg =>
                        msg._id === tempMessage._id
                            ? { 
                                ...savedMessage, 
                                sender: savedSenderId, // Store as string ID
                                senderObject: savedSenderObject,
                                isTemp: false, 
                                read: false
                            }
                            : msg
                    )
                );

                // Send via socket
                socketRef.current.emit("sendMessage", {
                    from: currentuser.id,
                    to: friendId,
                    message: messageText,
                    roomId: chatId,
                    _id: savedMessage._id,
                    timestamp: savedMessage.timestamp || new Date().toISOString()
                });

                console.log('✅ Message sent successfully');
            }
        } catch (error) {
            console.error("❌ Error sending message:", error);
            toast.error("Failed to send message");

            setMessages(prev =>
                prev.map(msg =>
                    msg._id === tempMessage._id
                        ? { ...msg, failed: true, isTemp: false }
                        : msg
                )
            );
        }
    };

    // 🔹 Handle input changes
    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value.length <= MAX_MESSAGE_LENGTH) {
            setNewMessage(value);
            
            if (value.trim() && socketRef.current?.connected) {
                handleTypingIndicator(true);
            } else if (!value.trim()) {
                handleTypingIndicator(false);
            }
        }
    };

    // 🔹 Handle key press
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendRealMessage(e);
        }
    };

    // 🔹 Format time
    const formatTime = (timestamp) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch {
            return "Just now";
        }
    };

    // 🔹 Check if message is from current user - FIXED VERSION
    const isMyMessage = (senderId) => {
        // Ensure we're comparing strings
        const senderIdStr = String(senderId);
        const currentUserIdStr = String(currentuser?.id);
        return senderIdStr === currentUserIdStr;
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading conversation...</p>
                    <p className="text-gray-400 text-sm mt-2">
                        {socketConnected ? 'Connected' : 'Connecting...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col">
            {/* Header */}
            <div className="bg-white/5 backdrop-blur-lg border-b border-white/10 sticky top-0 z-20 shadow-lg">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-300" />
                            </button>

                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                        {friend?.personalInfo?.firstName?.charAt(0) || 'U'}
                                    </div>
                                    <div className={`absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-white text-lg">{friendName}</h2>
                                    <p className="text-gray-400 text-sm">
                                        {isOnline ? (
                                            <span className="flex items-center">
                                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                                Online
                                                {isTyping && ' • Typing...'}
                                            </span>
                                        ) : 'Offline'}
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

            {/* Debug Info */}
            <div className="bg-black/50 text-xs p-2 text-center">
                <span className="text-green-400">User ID: {currentuser?.id}</span> | 
                <span className="text-blue-400 ml-2">Friend ID: {friendId}</span> | 
                <span className="text-yellow-400 ml-2">Chat ID: {chatId}</span> | 
                <span className="text-purple-400 ml-2">Messages: {messages.length}</span>
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
                                <p className="text-gray-400 mb-4">You matched with {friend?.personalInfo?.firstName || 'Friend'}. Say hi!</p>
                                <button
                                    onClick={() => setNewMessage('Hello! 👋')}
                                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-white hover:opacity-90 transition-opacity"
                                >
                                    Say Hello
                                </button>
                            </div>
                        </div>
                    ) : (
                        messages.map((message, index) => {
                            const sentByMe = isMyMessage(message.sender);
                            
                            console.log(`Message ${index}:`, {
                                sender: message.sender,
                                type: typeof message.sender,
                                isMyMessage: sentByMe,
                                currentUser: currentuser?.id
                            });

                            return (
                                <div
                                    key={message._id || index}
                                    className={`flex ${sentByMe ? 'justify-end' : 'justify-start'} mb-3`}
                                >
                                    <div className={`max-w-[85%] lg:max-w-[70%] flex ${sentByMe ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                                        {/* Avatar for friend's messages */}
                                        {!sentByMe && (
                                            <div className="w-8 h-8 flex-shrink-0">
                                                <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                    {friend?.personalInfo?.firstName?.charAt(0) || 'F'}
                                                </div>
                                            </div>
                                        )}

                                        {/* Message Bubble */}
                                        <div className={`px-4 py-3 rounded-2xl ${sentByMe
                                            ? message.failed
                                                ? 'bg-red-500/20 border border-red-500'
                                                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                            : 'bg-gray-800/90 text-gray-100 border border-gray-700/50'
                                            } ${message.isTemp ? 'opacity-70 animate-pulse' : ''} shadow-lg`}>
                                            
                                            {/* Text Message */}
                                            <p className="text-sm break-words leading-relaxed whitespace-pre-wrap">
                                                {message.message}
                                            </p>

                                            {/* Message Status */}
                                            <div className={`flex items-center space-x-2 mt-2 ${sentByMe ? 'justify-end' : 'justify-start'}`}>
                                                <span className={`text-xs ${sentByMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                                    {formatTime(message.timestamp)}
                                                </span>
                                                {sentByMe && (
                                                    <>
                                                        {message.failed ? (
                                                            <span className="text-xs text-red-300 font-bold">Failed</span>
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
                        })
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {/* Typing Indicator */}
            {isTyping && (
                <div className="max-w-4xl mx-auto w-full px-4 py-2">
                    <div className="flex items-center space-x-2 text-gray-400 text-sm animate-pulse">
                        <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {friend?.personalInfo?.firstName?.charAt(0) || 'F'}
                        </div>
                        <span>{friend?.personalInfo?.firstName || 'Friend'} is typing...</span>
                    </div>
                </div>
            )}

            {/* Message Input */}
            <div className="sticky bottom-0 z-10 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pt-4 pb-4">
                <div className="max-w-4xl mx-auto w-full px-4">
                    <div className="flex justify-between items-center mb-2 px-2">
                        <span className="text-gray-400 text-xs">
                            {isTyping ? `${friend?.personalInfo?.firstName || 'Friend'} is typing...` : 'Type your message...'}
                        </span>
                        <span className={`text-xs ${newMessage.length > MAX_MESSAGE_LENGTH ? 'text-red-400' : 'text-gray-400'}`}>
                            {newMessage.length}/{MAX_MESSAGE_LENGTH}
                        </span>
                    </div>

                    <form onSubmit={sendRealMessage} className="flex items-end space-x-2 bg-white/5 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-white/10">
                        <button 
                            type="button" 
                            className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                            onClick={() => toast('File upload coming soon!')}
                            disabled={!chatId || !socketConnected}
                            title="Attach file"
                        >
                            <Paperclip className="w-5 h-5 text-gray-300" />
                        </button>

                        <div className="flex-1 relative">
                            <textarea
                                value={newMessage}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyPress}
                                onFocus={() => handleTypingIndicator(true)}
                                onBlur={() => setTimeout(() => handleTypingIndicator(false), 100)}
                                placeholder={socketConnected ? "Type a message..." : "Connecting to chat..."}
                                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-white placeholder-gray-400 py-2 px-3 text-sm resize-none min-h-[44px] max-h-[120px]"
                                disabled={!chatId || !socketConnected}
                                rows="1"
                                style={{
                                    height: 'auto',
                                    minHeight: '44px'
                                }}
                            />
                        </div>

                        <button 
                            type="button" 
                            className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                            onClick={() => toast('Emoji picker coming soon!')}
                            disabled={!chatId || !socketConnected}
                            title="Add emoji"
                        >
                            <Smile className="w-5 h-5 text-gray-300" />
                        </button>

                        <button
                            type="submit"
                            disabled={!newMessage.trim() || !chatId || !socketConnected || newMessage.length > MAX_MESSAGE_LENGTH}
                            className={`p-3 rounded-full transition-all flex-shrink-0 ${
                                newMessage.trim() && chatId && socketConnected && newMessage.length <= MAX_MESSAGE_LENGTH
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                                    : 'bg-white/10 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>

                    {!socketConnected && (
                        <div className="text-center mt-2">
                            <p className="text-red-400 text-xs flex items-center justify-center">
                                <span className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></span>
                                Not connected to chat server
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
