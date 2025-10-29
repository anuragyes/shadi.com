
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  Search,
  MessageCircle,
  Users,
  UserCheck,
  Clock,
  MoreVertical,
  Phone,
  Video,
  Star,
  MapPin,
  Calendar
} from 'lucide-react';

import { AuthContext } from "../Context/Authcontext.js"

const FriendsList = () => {
      const BASE_URL = "http://localhost:5000";
  const [friends, setFriends] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const {
    currentuser,
    isLoggedIn,
  } = useContext(AuthContext);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/user/request/friends`, {
          withCredentials: true,
        });

        console.log("Friends API Response:", res);

        if (res.data.success) {
          // Handle both array and object responses
          const friendsData = res.data.data || [];
          const friendData = friendsData.map((friend) => {
            // Handle different response structures
            const userData = friend.user || friend;

            return {
              id: userData._id || friend._id,
              name: `${userData.personalInfo?.firstName || userData.firstName || "User"} ${userData.personalInfo?.lastName || userData.lastName || ""}`.trim(),
              avatar: userData.gallery?.[0] || userData.profilePicture || "https://placehold.co/150x150/333/fff?text=User",
              isOnline: userData.isActive || userData.isOnline || false,
              lastSeen: userData.lastActive ? new Date(userData.lastActive).toLocaleDateString() : "Recently",
              location: userData.location?.city || userData.city || "Unknown location",
              citizenship: userData.citizenship || userData.location?.country || "Unknown",
              mutualFriends: Math.floor(Math.random() * 10),
              friendshipDate: friend.createdAt || userData.createdAt || new Date(),
              isFavorite: false,
              unreadMessages: 0,
              lastMessage: "Start a conversation",
              lastMessageTime: "",
            };
          });

          console.log("this is fronted data ", friendData);
          setFriends(friendData);
        } else {
          console.warn("API returned success: false", res.data);
          setFriends([]);
        }
      } catch (err) {
        console.error("Error fetching friends:", err.response?.data || err.message);
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchFriends();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const filteredFriends = friends.filter(friend => {
    const matchesSearch = friend.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'online' && friend.isOnline) ||
      (activeTab === 'favorites' && friend.isFavorite);

    return matchesSearch && matchesTab;
  });

  const onlineCount = friends.filter(f => f.isOnline).length;
  const favoriteCount = friends.filter(f => f.isFavorite).length;

  const navigate = useNavigate();

  // Show login required message
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-linear-to-rfrom-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-gray-300 mb-6">
            Please log in to view your friends list and connect with people.
          </p>
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-linear-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Login to Continue
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="border border-gray-600 text-gray-300 py-3 px-6 rounded-xl font-semibold hover:bg-white/10 transition-all"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your friends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Friends</h1>
            <p className="text-gray-400">Stay connected with your friends</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/discovery"
              className="bg-white/10 backdrop-blur-lg border border-white/10 px-6 py-2 rounded-xl hover:bg-white/20 transition-all"
            >
              Discover More
            </Link>
          </div>
        </div>

        {/* Stats Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">{friends.length}</div>
            <div className="text-gray-400">Total Friends</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{onlineCount}</div>
            <div className="text-gray-400">Online Now</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{favoriteCount}</div>
            <div className="text-gray-400">Favorites</div>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-all"
              />
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 bg-white/10 rounded-xl p-1">
              {[
                { key: 'all', label: 'All Friends', count: friends.length },
                { key: 'online', label: 'Online', count: onlineCount },
                { key: 'favorites', label: 'Favorites', count: favoriteCount }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg transition-all text-sm whitespace-nowrap ${activeTab === tab.key
                    ? 'bg-linear-to-rfrom-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Friends Grid */}
        {friends.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">No friends yet</h3>
            <p className="text-gray-500 mb-6">Start connecting with people to build your friends list</p>
            <Link
              to="/discovery"
              className="bg-linear-to-rfrom-pink-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all inline-block"
            >
              Discover People
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFriends.map(friend => (
                <div
                  key={friend.id}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  {/* Friend Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-14 h-14 rounded-2xl object-cover"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/150x150/333/fff?text=User";
                          }}
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${friend.isOnline ? 'bg-green-500' : 'bg-gray-500'
                          }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white flex items-center space-x-2">
                          {friend.name}
                          {friend.isFavorite && (
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          )}
                        </h3>
                        <div className="flex items-center space-x-1 text-sm text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{friend.isOnline ? 'Online now' : `Last seen ${friend.lastSeen}`}</span>
                        </div>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-lg">
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Friend Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{friend.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{friend.mutualFriends} mutual friends</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{friend.citizenship}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>Friends since {new Date(friend.friendshipDate).toLocaleDateString()}</span>
                    </div>
                  </div>



                  {/* Last Message Preview */}
                  <div className="mb-4 p-3 bg-white/5 rounded-xl">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-gray-400">Last message</span>
                      <span className="text-xs text-gray-500">{friend.lastMessageTime}</span>
                    </div>
                    <p className="text-sm text-gray-300 truncate">{friend.lastMessage}</p>
                    {friend.unreadMessages > 0 && (
                      <div className="flex justify-end mt-2">
                        <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                          {friend.unreadMessages} new
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/chat/${friend.id}`}
                      state={{ friendName: friend.name }} // <-- pass the name here
                      className="flex-1 bg-linear-to-rfrom-pink-500 to-purple-600 text-white py-2 px-4 rounded-xl text-center font-semibold hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Message</span>
                    </Link>

                    <button className="p-2 bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-all">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </button>
                    <button className="p-2 bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-all">
                      <Video className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredFriends.length === 0 && friends.length > 0 && (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl text-gray-400 mb-2">No friends found</h3>
                <p className="text-gray-500">Try adjusting your search terms</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FriendsList;