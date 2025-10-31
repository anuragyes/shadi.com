


import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../Context/Authcontext.js';
import { 
    Search, 
    Video, 
    Mail,
    CheckCheck,
    Clock,
    UserPlus,
    ArrowLeft,
    Users,
    MessageCircle
} from 'lucide-react';

const ChatList = () => {
    const BASE_URL = "https://shadii-com.onrender.com";
    const [friends, setFriends] = useState([]);
    const [generalFriends, setGeneralFriends] = useState([]);
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('primary');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const navigate = useNavigate();
    const { currentuser } = useContext(AuthContext);

    console.log("Current user:", currentuser?.id || currentuser?._id);

    // Fetch friends WITH conversations
    const fetchChatFriends = async () => {
        try {
            setLoading(true);
            const userId = currentuser?.id || currentuser?._id;
            
            if (!userId) {
                console.error("No user ID found");
                return;
            }

            console.log("Fetching chat friends for user:", userId);
            
            const res = await axios.get(
                `${BASE_URL}/api/user/request/friends/with-conversations/${userId}`, 
                {
                    withCredentials: true,
                   
                }
            );

            console.log("Chat friends API response:", res.data);
            
            if (res.data && res.data.success) {
                // FIXED: Backend returns res.data.data (array), not res.data.data.friends
                const friendsData = res.data.data || [];
                setFriends(friendsData);
                setFilteredFriends(friendsData);
                console.log("Chat friends data:", friendsData);
            } else {
                console.error("Chat friends API returned success: false", res.data?.message);
                setFriends([]);
                setFilteredFriends([]);
            }
        } catch (error) {
            console.error("Error fetching chat friends:", error);
            if (error.response) {
                console.error("Response error:", error.response.data);
            }
            setFriends([]);
            setFilteredFriends([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch friends WITHOUT conversations (General tab)
    const fetchGeneralFriends = async () => {
        try {
            const userId = currentuser?.id || currentuser?._id;
            
            if (!userId) {
                console.error("No user ID found");
                return;
            }

            console.log("Fetching general friends for user:", userId);
            
            const res = await axios.get(
                `${BASE_URL}/api/user/request/friends/no-conversations/${userId}`, 
                {
                    withCredentials: true,
                    
                }
            );

            console.log("General friends API response:", res.data);
            
            if (res.data && res.data.success) {
                // FIXED: Backend returns res.data.data, not res.data.friends
                const generalFriendsData = res.data.data || [];
                setGeneralFriends(generalFriendsData);
                console.log("General friends data:", generalFriendsData);
            } else {
                console.error("General friends API returned success: false", res.data?.message);
                setGeneralFriends([]);
            }
        } catch (error) {
            console.error("Error fetching general friends:", error);
            if (error.response) {
                console.error("Response error:", error.response.data);
            }
         
           
        }
    };

    useEffect(() => {
        if (currentuser) {
            console.log("Current user found, fetching friends...");
            fetchChatFriends();
            fetchGeneralFriends();
        } else {
            console.log("No current user found");
            setLoading(false);
        }
    }, [currentuser]);

    // Search functionality
    useEffect(() => {
        if (searchQuery.trim() === '') {
            if (activeTab === 'primary') {
                setFilteredFriends(friends);
            } else {
                setFilteredFriends(generalFriends);
            }
        } else {
            const sourceArray = activeTab === 'primary' ? friends : generalFriends;
            const filtered = sourceArray.filter(friend => {
                const firstName = friend.personalInfo?.firstName?.toLowerCase() || '';
                const lastName = friend.personalInfo?.lastName?.toLowerCase() || '';
                const fullName = `${firstName} ${lastName}`.toLowerCase();
                const name = friend.name?.toLowerCase() || '';
                const query = searchQuery.toLowerCase();
                
                return firstName.includes(query) || 
                       lastName.includes(query) || 
                       fullName.includes(query) ||
                       name.includes(query);
            });
            setFilteredFriends(filtered);
        }
    }, [searchQuery, friends, generalFriends, activeTab]);

    // Update filtered friends when tab changes
    useEffect(() => {
        if (activeTab === 'primary') {
            setFilteredFriends(friends);
        } else {
            setFilteredFriends(generalFriends);
        }
        setSearchQuery('');
    }, [activeTab, friends, generalFriends]);

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffInHours = (now - date) / (1000 * 60 * 60);
            
            if (diffInHours < 1) {
                const minutes = Math.floor(diffInHours * 60);
                return `${minutes}m`;
            } else if (diffInHours < 24) {
                return `${Math.floor(diffInHours)}h`;
            } else if (diffInHours < 168) {
                return `${Math.floor(diffInHours / 24)}d`;
            } else {
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
        } catch (error) {
            return '';
        }
    };

    const formatMatchTime = (timestamp) => {
        if (!timestamp) return 'Recently matched';
        
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
            
            if (diffInDays === 0) return 'Today';
            if (diffInDays === 1) return 'Yesterday';
            if (diffInDays < 7) return `${diffInDays} days ago`;
            if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
            return `${Math.floor(diffInDays / 30)} months ago`;
        } catch (error) {
            return 'Recently matched';
        }
    };

    const getStatusIcon = (friend) => {
        if (friend.isOnline || friend.isActive) {
            return <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>;
        }
        return null;
    };

    const getMessageStatus = (message) => {
        if (!message) return null;
        
        // Adjust based on your actual message structure
        if (message.read) {
            return <CheckCheck className="w-3 h-3 text-blue-400" />;
        } else {
            return <CheckCheck className="w-3 h-3 text-gray-400" />;
        }
    };

    const handleChatClick = (friend) => {
        const friendId = friend.friendId || friend._id;
        navigate(`/chat/${friendId}`, { 
            state: { 
                friendName: getDisplayName(friend),
                chatId: friend.chatId
            } 
        });
    };

      console.log("trhis is caht ")

    // const handleStartChat = (friend) => {
    //     navigate(`/chat/${friend.id}`, { 
    //         state: { 
    //             friendName: getDisplayName(friend),
    //             isNewChat: true
    //         } 
    //     });
    // };

    const getMessagePreview = (friend) => {
        if (!friend.lastMessage) {
            return <span className="text-gray-400 italic">No messages yet</span>;
        }
        
        let prefix = '';
        // Check if last message was sent by current user
        if (friend.lastMessage.sender === currentuser?.id) {
            prefix = 'You: ';
        }
        
        if (friend.unreadCount > 0) {
            return <span className="text-white font-medium">{prefix}{friend.lastMessage}</span>;
        }
        
        return <span className="text-gray-300">{prefix}{friend.lastMessage}</span>;
    };

    const getGeneralPreview = (friend) => {
        return (
            <div className="flex items-center space-x-2">
                <Users className="w-3 h-3 text-gray-400" />
                <span className="text-gray-400 text-xs">
                    Matched {formatMatchTime(friend.matchDate)}
                </span>
            </div>
        );
    };

    // Helper function to get display name
    const getDisplayName = (friend) => {
        if (friend.name) return friend.name; // For friends with conversations
        if (friend.personalInfo) {
            return `${friend.personalInfo.firstName || ''} ${friend.personalInfo.lastName || ''}`.trim();
        }
        return 'User';
    };

    // Helper function to get profile photo
    const getProfilePhoto = (friend) => {
        return friend.profilePhoto || (friend.profilePhotos && friend.profilePhotos[0]);
    };

    // Helper function to get last message timestamp
    const getLastMessageTime = (friend) => {
        return friend.lastMessageAt || friend.lastMessage?.timestamp;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading conversations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            {/* Desktop Layout */}
            <div className="hidden lg:flex max-w-6xl mx-auto">
                {/* Sidebar */}
                <div className="w-80 bg-white/5 backdrop-blur-lg border-r border-white/10 h-screen sticky top-0">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                                Messages
                            </h1>
                            <div className="flex space-x-3">
                                <button className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200">
                                    <Video className="w-5 h-5 text-gray-300" />
                                </button>
                                <button className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200">
                                    <Mail className="w-5 h-5 text-gray-300" />
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="mt-6 relative">
                            <Search className={`w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                                isSearchFocused ? 'text-pink-400' : 'text-gray-400'
                            }`} />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab === 'primary' ? 'messages' : 'friends'}`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        <button
                            className={`flex-1 py-4 text-center font-semibold border-b-2 transition-colors flex items-center justify-center space-x-2 ${
                                activeTab === 'primary' 
                                    ? 'border-pink-500 text-white' 
                                    : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                            onClick={() => setActiveTab('primary')}
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>Primary</span>
                            {friends.length > 0 && (
                                <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-1 min-w-6">
                                    {friends.length}
                                </span>
                            )}
                        </button>
                        <button
                            className={`flex-1 py-4 text-center font-semibold border-b-2 transition-colors flex items-center justify-center space-x-2 ${
                                activeTab === 'general' 
                                    ? 'border-pink-500 text-white' 
                                    : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                            onClick={() => setActiveTab('general')}
                        >
                            <Users className="w-4 h-4" />
                            <span>General</span>
                            {generalFriends.length > 0 && (
                                <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-1 min-w-6">
                                    {generalFriends.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Chat List */}
                    <div className="overflow-y-auto h-[calc(100vh-200px)]">
                        {filteredFriends.length === 0 ? (
                            <div className="text-center py-12 px-6">
                                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    {activeTab === 'primary' ? (
                                        <Mail className="w-8 h-8 text-gray-400" />
                                    ) : (
                                        <Users className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {activeTab === 'primary' ? 'No Messages' : 'No Friends'}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {activeTab === 'primary' 
                                        ? 'Your conversations will appear here' 
                                        : 'Your matches will appear here'
                                    }
                                </p>
                            </div>
                        ) : (
                            filteredFriends.map((friend) => (
                                <div
                                    key={friend.friendId || friend._id}
                                    className={`flex items-center px-6 py-4 hover:bg-white/5 cursor-pointer border-b border-white/5 transition-all duration-200 group ${
                                        activeTab === 'general' ? 'flex-col items-start space-y-3' : ''
                                    }`}
                                    // onClick={() => activeTab === 'primary' ? handleChatClick(friend) : handleStartChat(friend)}
                                >
                                    <div className="flex items-center w-full">
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <div className={`${
                                                activeTab === 'primary' ? 'w-12 h-12' : 'w-14 h-14'
                                            } bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg`}>
                                                {getProfilePhoto(friend) ? (
                                                    <img 
                                                        src={getProfilePhoto(friend)} 
                                                        alt={getDisplayName(friend)}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    getDisplayName(friend).charAt(0) || 'U'
                                                )}
                                            </div>
                                            {getStatusIcon(friend)}
                                        </div>

                                        {/* Chat Info */}
                                        <div className="flex-1 ml-4 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-white text-sm truncate">
                                                    {getDisplayName(friend)}
                                                </h3>
                                                {activeTab === 'primary' && (
                                                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                                                        {getLastMessageTime(friend) && (
                                                            <span>{formatTime(getLastMessageTime(friend))}</span>
                                                        )}
                                                        {getMessageStatus(friend.lastMessage)}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-1">
                                                <div className="text-sm truncate flex-1">
                                                    {activeTab === 'primary' ? getMessagePreview(friend) : getGeneralPreview(friend)}
                                                </div>
                                                
                                                {/* Unread indicator for primary tab */}
                                                {activeTab === 'primary' && friend.unreadCount > 0 && (
                                                    <div className="ml-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 shadow-lg">
                                                        {friend.unreadCount > 9 ? '9+' : friend.unreadCount}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Start Chat Button for General Tab */}
                                    
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Content Area - Preview */}
                <div className="flex-1 flex items-center justify-center p-12">
                    <div className="text-center max-w-md">
                        <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                            {activeTab === 'primary' ? (
                                <Mail className="w-10 h-10 text-white" />
                            ) : (
                                <Users className="w-10 h-10 text-white" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">
                            {activeTab === 'primary' ? 'Your Messages' : 'Your Matches'}
                        </h2>
                        <p className="text-gray-300 mb-6">
                            {activeTab === 'primary' 
                                ? 'Send private messages to your matches and start meaningful conversations.'
                                : 'Connect with your matches and start new conversations.'
                            }
                        </p>
                        <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                            {activeTab === 'primary' ? 'Send Message' : 'Browse Matches'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden">
                {/* Header */}
                <div className="bg-white/5 backdrop-blur-lg border-b border-white/10 sticky top-0 z-10">
                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-300" />
                                </button>
                                <h1 className="text-xl font-bold text-white">Messages</h1>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                    <Video className="w-5 h-5 text-gray-300" />
                                </button>
                                <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                    <UserPlus className="w-5 h-5 text-gray-300" />
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="mt-3 relative">
                            <Search className={`w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                                isSearchFocused ? 'text-pink-400' : 'text-gray-400'
                            }`} />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab === 'primary' ? 'messages' : 'friends'}`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:bg-white/15 transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        <button
                            className={`flex-1 py-3 text-center font-semibold border-b-2 transition-colors flex items-center justify-center space-x-2 ${
                                activeTab === 'primary' 
                                    ? 'border-pink-500 text-white' 
                                    : 'border-transparent text-gray-400'
                            }`}
                            onClick={() => setActiveTab('primary')}
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>Primary</span>
                            {friends.length > 0 && (
                                <span className="bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-5">
                                    {friends.length}
                                </span>
                            )}
                        </button>
                        <button
                            className={`flex-1 py-3 text-center font-semibold border-b-2 transition-colors flex items-center justify-center space-x-2 ${
                                activeTab === 'general' 
                                    ? 'border-pink-500 text-white' 
                                    : 'border-transparent text-gray-400'
                            }`}
                            onClick={() => setActiveTab('general')}
                        >
                            <Users className="w-4 h-4" />
                            <span>General</span>
                            {generalFriends.length > 0 && (
                                <span className="bg-purple-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-5">
                                    {generalFriends.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Chat List */}
                <div className="pb-20">
                    {filteredFriends.length === 0 ? (
                        <div className="text-center py-12 px-6">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                {activeTab === 'primary' ? (
                                    <Mail className="w-6 h-6 text-gray-400" />
                                ) : (
                                    <Users className="w-6 h-6 text-gray-400" />
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                {activeTab === 'primary' ? 'No Messages' : 'No Friends'}
                            </h3>
                            <p className="text-gray-400 text-sm">
                                {activeTab === 'primary' 
                                    ? 'Start a conversation with your matches' 
                                    : 'Your matches will appear here'
                                }
                            </p>
                        </div>
                    ) : (
                        filteredFriends.map((friend) => (
                            <div
                                key={friend.friendId || friend._id}
                                className={`flex items-center px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 active:bg-white/10 transition-colors ${
                                    activeTab === 'general' ? 'flex-col items-start space-y-3' : ''
                                }`}
                                onClick={() => activeTab === 'primary' ? handleChatClick(friend) : handleStartChat(friend)}
                            >
                                <div className="flex items-center w-full">
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                                            {getProfilePhoto(friend) ? (
                                                <img 
                                                    src={getProfilePhoto(friend)} 
                                                    alt={getDisplayName(friend)}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                getDisplayName(friend).charAt(0) || 'U'
                                            )}
                                        </div>
                                        {getStatusIcon(friend)}
                                    </div>

                                    {/* Chat Info */}
                                    <div className="flex-1 ml-3 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-white text-sm truncate">
                                                {getDisplayName(friend)}
                                            </h3>
                                            {activeTab === 'primary' && (
                                                <div className="flex items-center space-x-1 text-xs text-gray-400">
                                                    {getLastMessageTime(friend) && (
                                                        <span>{formatTime(getLastMessageTime(friend))}</span>
                                                    )}
                                                    {getMessageStatus(friend.lastMessage)}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-1">
                                            <div className="text-sm truncate flex-1">
                                                {activeTab === 'primary' ? getMessagePreview(friend) : getGeneralPreview(friend)}
                                            </div>
                                            
                                            {/* Unread indicator for primary tab */}
                                            {activeTab === 'primary' && friend.unreadCount > 0 && (
                                                <div className="ml-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 shadow-lg">
                                                    {friend.unreadCount > 9 ? '9+' : friend.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Start Chat Button for General Tab */}
                                
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-20">
                <button className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-110 active:scale-95">
                    <Mail className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default ChatList;

