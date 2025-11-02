


import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Users, Search, Filter, MapPin, Briefcase, GraduationCap, Mountain, Camera, Music, Utensils, BookOpen, Palette, Sparkles, Heart, MessageCircle, MoreHorizontal } from "lucide-react";

import { AuthContext } from '../Context/Authcontext.js';
import toast from "react-hot-toast";

const Discovery = () => {
  const BASE_URL = "https://shadii-com.onrender.com";
  const navigate = useNavigate();
  const { currentuser, isLoggedIn } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [connectionStatuses, setConnectionStatuses] = useState({});

  const getDefaultPhoto = (gender) => {
    if (gender?.toLowerCase() === "female") return "https://placehold.co/400x400/FFB6C1/FFFFFF?text=F";
    if (gender?.toLowerCase() === "male") return "https://placehold.co/400x400/87CEEB/FFFFFF?text=M";
    return "https://placehold.co/400x400/CCCCCC/FFFFFF?text=U";
  };

  // Fetch connection status for a specific user
  const fetchConnectionStatus = async (userId) => {
    if (!userId || !isLoggedIn || (!currentuser?._id && !currentuser?.id)) {
      return "none";
    }

    try {
      const res = await axios.get(
        `${BASE_URL}/api/user/request/status`,
        {
          params: {
            receiverId: userId,
            senderId: currentuser?._id || currentuser?.id
          },
          withCredentials: true
        }
      );

      if (res.data.success) {
        return {
          status: res.data.status,
          requestId: res.data.requestId
        };
      }
    } catch (err) {
      console.error("Error fetching connection status:", err.response?.data || err.message);
    }
    return { status: "none", requestId: null };
  };

  // Fetch all users and their connection statuses
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await axios.get(`${BASE_URL}/api/user/all-users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        const usersArray = res.data || [];
        const currentUserId = currentuser?._id;

        const mappedUsers = usersArray
          .filter((u) => u._id !== currentUserId)
          .map((u) => ({
            id: u._id,
            name: `${u.personalInfo?.firstName || "Unknown"} ${u.personalInfo?.lastName || ""}`,
            location: u.location?.current?.city || u.location?.city || "Earth",
            photos: u.gallery?.length ? u.gallery : [getDefaultPhoto(u.personalInfo?.gender)],
            bio: u.personalInfo?.aboutMe || "No bio available",
            interests: [...(u.lifestyleInfo?.hobbies || []), ...(u.lifestyleInfo?.interests || [])].slice(0, 4),
            occupation: u.professionalInfo?.occupation?.replace(/_/g, " ") || "Unspecified",
            education: u.professionalInfo?.education?.highestDegree || "N/A",
            compatibility: Math.floor(Math.random() * 40) + 60,
            isOnline: Math.random() > 0.5,
            isFriend: false,
            friendStatus: "none",
            chatRequestId: null,
          }));

        setUsers(mappedUsers);

        // Fetch connection status for each user
        const statusPromises = mappedUsers.map(async (user) => {
          const connectionData = await fetchConnectionStatus(user.id);
          return { userId: user.id, ...connectionData };
        });

        const statusResults = await Promise.all(statusPromises);
        const statusMap = {};
        statusResults.forEach(result => {
          statusMap[result.userId] = {
            status: result.status,
            requestId: result.requestId
          };
        });

        setConnectionStatuses(statusMap);
      } catch (err) {
        console.error("Error fetching users:", err.message);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isLoggedIn, currentuser]);

 const handleAddFriend = async (userId, e) => {
  e.stopPropagation();

  try {
    const res = await axios.post(
      `${BASE_URL}/api/user/request/chat-request/send`,
      {
        senderId: currentuser?._id || currentuser?.id,
        receiverId: userId
      },
      { withCredentials: true }
    );

    console.log("res data from discovery:", res);

    // ✅ Fix: Use the correct structure based on actual response
    if (res.data.success && res.data.data) {
      const chatRequest = res.data.data;

      toast.success("Request sent successfully");

      // Update both users state and connection statuses
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                isFriend: true,
                friendStatus: "pending",
                chatRequestId: chatRequest._id
              }
            : u
        )
      );

      setConnectionStatuses((prev) => ({
        ...prev,
        [userId]: {
          status: "pending",
          requestId: chatRequest._id
        }
      }));
    }
  } catch (err) {
    console.error(
      "Error sending chat request:",
      err.response?.data || err.message
    );
    alert("Failed to send connection request. Please try again.");
  }
};

  const handleCancelRequest = async (requestId, userId, e) => {
  e.stopPropagation();

  try {
    const senderId = currentuser?._id || currentuser?.id;

    //  console.log("this is sender request " ,senderId)

    const res = await axios.put(
      `${BASE_URL}/api/user/request/cancel-by-user`,
      {
        senderId,
        receiverId: userId,
      },
      { withCredentials: true }
    );

     console.log("this is reciver request" , requestId)

    console.log("🗑️ Cancel response:", res);

    if (res.data.success) {
      toast.success("Request cancelled successfully");

      // Update UI states
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, isFriend: false, friendStatus: "none", chatRequestId: null }
            : u
        )
      );

      setConnectionStatuses((prev) => ({
        ...prev,
        [userId]: {
          status: "none",
          requestId: null,
        },
      }));
    }
  } catch (err) {
    console.error("❌ Error cancelling chat request:", err.response?.data || err.message);
    const errorMessage = err.response?.data?.message || "Failed to cancel request";
    toast.error(errorMessage);
  }
};


  const handleSendMessage = async (userId, e) => {
    e.stopPropagation();
    try {
      const connectionStatus = connectionStatuses[userId]?.status;
      
      if (connectionStatus !== "accepted") {
        alert("You need to be connected to message this user");
        return;
      }

      navigate(`/chat/${userId}`);
    } catch (err) {
      console.error("Error starting chat:", err.response?.data || err.message);
      alert("Failed to open chat");
    }
  };

  const handleCardClick = (userId) => {
    navigate(`/userprofile/${userId}`);
  };

  const getInterestIcon = (interest) => {
    const iconMap = {
      Hiking: Mountain,
      Photography: Camera,
      Coffee: Utensils,
      Travel: MapPin,
      Technology: Briefcase,
      Fitness: Sparkles,
      Reading: BookOpen,
      Cooking: Utensils,
      Dancing: Music,
      Yoga: Sparkles,
      Beach: Mountain,
      Music: Music,
      Food: Utensils,
      Writing: BookOpen,
      Nature: Mountain,
      Science: GraduationCap,
      Film: Camera,
      Art: Palette,
    };
    return iconMap[interest] || Sparkles;
  };

  const getButtonConfig = (userId) => {
    const connectionStatus = connectionStatuses[userId]?.status;
    const requestId = connectionStatuses[userId]?.requestId;

    switch (connectionStatus) {
      case "pending":
        return {
          text: "Cancel Request",
          className: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
          onClick: (e) => handleCancelRequest(requestId, userId, e)
        };
      case "accepted":
        return {
          text: "Send Message",
          className: "bg-green-500 text-white hover:bg-green-600",
          onClick: (e) => handleSendMessage(userId, e)
        };
      default:
        return {
          text: "Connect",
          className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg",
          onClick: (e) => handleAddFriend(userId, e)
        };
    }
  };

  if (!isLoggedIn) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg w-full max-w-md">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Discovery</h2>
        <p className="text-gray-600 mb-6">Please login to discover amazing people around you</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all w-full sm:w-auto"
        >
          Sign In
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading amazing people...</p>
      </div>
    </div>
  );

  const filteredUsers = users.filter((user) =>
    searchTerm === "" ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.interests.some(interest => interest.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-200 p-3 sm:p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Discover People</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Find amazing connections around you</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:min-w-[280px] lg:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search by name, interests, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
              />
            </div>

            <button className="p-2 sm:p-3 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-all w-full sm:w-auto">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* User Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-2xl shadow-sm mx-2 sm:mx-0">
            <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No users found</h3>
            <p className="text-gray-500 text-sm sm:text-base">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredUsers.map((req) => {
              const buttonConfig = getButtonConfig(req.id);
              
              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                  onClick={() => handleCardClick(req.id)}
                >
                  {/* Image Section */}
                  <div className="relative">
                    <img
                      src={req.photos[0]}
                      alt={req.name}
                      className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Online Status */}
                    {req.isOnline && (
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}

                    {/* Compatibility Score */}
                    <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-pink-500 fill-current" />
                        <span className="text-xs sm:text-sm font-semibold text-gray-800">{req.compatibility}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-3 sm:p-4 md:p-5">
                    {/* Name and Location */}
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate">{req.name}</h3>
                        <div className="flex items-center gap-1 text-gray-500 mt-1">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm truncate">{req.location}</span>
                        </div>
                      </div>
                      <button
                        className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 ml-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </button>
                    </div>

                    {/* Bio */}
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">{req.bio}</p>

                    {/* Professional Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                      {req.occupation && req.occupation !== "Unspecified" && (
                        <div className="flex items-center gap-1 truncate">
                          <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{req.occupation}</span>
                        </div>
                      )}
                      {req.education && req.education !== "N/A" && (
                        <div className="flex items-center gap-1 truncate">
                          <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{req.education}</span>
                        </div>
                      )}
                    </div>

                    {/* Interests */}
                    {req.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                        {req.interests.slice(0, 3).map((interest, i) => {
                          const Icon = getInterestIcon(interest);
                          return (
                            <span
                              key={i}
                              className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0"
                            >
                              <Icon className="w-3 h-3" />
                              <span className="hidden xs:inline">{interest}</span>
                            </span>
                          );
                        })}
                        {req.interests.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                            +{req.interests.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={buttonConfig.onClick}
                      className={`w-full py-2 sm:py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm sm:text-base ${buttonConfig.className}`}
                    >
                      {buttonConfig.text === "Send Message" && <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
                      <span>{buttonConfig.text}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discovery;
