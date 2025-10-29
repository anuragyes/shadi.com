
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Users, Search, Filter, MapPin, Briefcase, GraduationCap, Mountain, Camera, Music, Utensils, BookOpen, Palette, Sparkles, Heart, MessageCircle, MoreHorizontal } from "lucide-react";

import { AuthContext } from '../Context/Authcontext.js';

const Discovery = () => {
    const BASE_URL = "http://localhost:5000";
  const navigate = useNavigate();
  const { currentuser, isLoggedIn } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const getDefaultPhoto = (gender) => {
    if (gender?.toLowerCase() === "female") return "https://placehold.co/400x400/FFB6C1/FFFFFF?text=F";
    if (gender?.toLowerCase() === "male") return "https://placehold.co/400x400/87CEEB/FFFFFF?text=M";
    return "https://placehold.co/400x400/CCCCCC/FFFFFF?text=U";
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
 
        const res = await axios.get(`${BASE_URL}/api/user/all-users`, {
          
        });

        // console.log("API Response:", res);
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
        `${BASE_URL}/api/user/chat-request/send`,
        { receiverId: userId },
      );

      if (res.data.success && res.data.chatRequest) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, isFriend: true, friendStatus: "pending", chatRequestId: res.data.chatRequest._id }
              : u
          )
        );
      }
    } catch (err) {
      console.error("Error sending chat request:", err.response?.data || err.message);
    }
  };

  const handleCancelRequest = async (chatRequestId, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/api/user/chat-request/request/${chatRequestId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.chatRequestId === chatRequestId
              ? { ...u, isFriend: false, friendStatus: "none", chatRequestId: null }
              : u
          )
        );
      }
    } catch (err) {
      console.error("Error cancelling chat request:", err.response?.data || err.message);
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

  if (!isLoggedIn) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Discovery</h2>
        <p className="text-gray-600 mb-6">Please login to discover amazing people around you</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
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
    user.bio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-200 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Discover People</h1>
            <p className="text-gray-600 mt-2">Find amazing connections around you</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, interests, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <button className="p-3 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-all">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

       
      </div>

      {/* User Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => handleCardClick(user.id)}
              >
                {/* Image Section */}
                <div className="relative">
                  <img
                    src={user.photos[0]}
                    alt={user.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Online Status */}
                  {user.isOnline && (
                    <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}

                  {/* Compatibility Score */}
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-pink-500 fill-current" />
                      <span className="text-sm font-semibold text-gray-800">{user.compatibility}%</span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5">
                  {/* Name and Location */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 truncate">{user.name}</h3>
                      <div className="flex items-center gap-1 text-gray-500 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{user.location}</span>
                      </div>
                    </div>
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{user.bio}</p>

                  {/* Professional Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    {user.occupation && user.occupation !== "Unspecified" && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span className="truncate">{user.occupation}</span>
                      </div>
                    )}
                    {user.education && user.education !== "N/A" && (
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        <span className="truncate">{user.education}</span>
                      </div>
                    )}
                  </div>

                  {/* Interests */}
                  {user.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {user.interests.slice(0, 3).map((interest, i) => {
                        const Icon = getInterestIcon(interest);
                        return (
                          <span
                            key={i}
                            className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium"
                          >
                            <Icon className="w-3 h-3" />
                            {interest}
                          </span>
                        );
                      })}
                      {user.interests.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                          +{user.interests.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={(e) =>
                      user.friendStatus === "pending"
                        ? handleCancelRequest(user.chatRequestId, e)
                        : handleAddFriend(user.id, e)
                    }
                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                      user.friendStatus === "pending"
                        ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg"
                    }`}
                  >
                    {user.friendStatus === "pending" ? (
                      <>
                        <span>Cancel Request</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discovery;