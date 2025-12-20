


import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  UserPlus,
  UserCheck,
  UserX,
  Users,
  MapPin,
  Briefcase,
  GraduationCap,
  X,
  Check,
  MoreVertical,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { AuthContext } from '../Context/Authcontext.js';
import toast from "react-hot-toast";

const Discovery = () => {
  const BASE_URL = "https://shadii-com.onrender.com";
  const navigate = useNavigate();
  const { currentuser, isLoggedIn } = useContext(AuthContext);


  // console.log("this is user id", currentuser)

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [filters, setFilters] = useState({
    location: "",
    occupation: "",
    education: ""
  });

  // Get gradient avatar
  const getGradientAvatar = (user) => {
    if (user?.gallery?.length > 0) return user.gallery[0];

    const name = `${user?.personalInfo?.firstName || "User"} ${user?.personalInfo?.lastName || ""}`.trim();
    const initial = name.charAt(0).toUpperCase();

    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    ];

    const gradient = gradients[Math.floor(Math.random() * gradients.length)];
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><linearGradient id="grad" gradientTransform="rotate(45)"><stop offset="0%" stop-color="%23667eea"/><stop offset="100%" stop-color="%23764ba2"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23grad)"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="40" font-weight="bold">${initial}</text></svg>`;
  };

  // Fetch connection status
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
        return res.data.status;
      }
    } catch (err) {
      console.error("Error fetching connection status:", err.response?.data || err.message);
    }
    return "none";
  };



  useEffect(() => {
    console.log("🔥 useEffect triggered");
    console.log("isLoggedIn:", isLoggedIn);
    console.log("currentuser:", currentuser);

    const userId = currentuser?.id; // Use `id` from currentuser

    if (!isLoggedIn || !userId) {
      console.log("⏹ useEffect exited early: user not ready");
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        console.log("🔹 Starting API call to fetch all users, userId:", userId);

        const res = await axios.get(`${BASE_URL}/api/user/all-users/${userId}`, {
          withCredentials: true,
        });

        console.log("✅ API response received:", res.data);

        const usersArray = res.data || [];

        // Exclude current user
        const otherUsers = usersArray.filter(u => u._id !== userId);
        console.log("Filtered users (exclude self):", otherUsers);

        // Fetch connection status in parallel
        const statusPromises = otherUsers.map(u =>
          fetchConnectionStatus(u._id)
            .then(status => {
              console.log(`Status for ${u._id}:`, status);
              return status;
            })
            .catch(err => {
              console.error(`❌ Error fetching status for ${u._id}:`, err.message);
              return "none";
            })
        );

        const statuses = await Promise.all(statusPromises);
        console.log("✅ All statuses fetched:", statuses);

        // Format users
        const formattedUsers = otherUsers.map((u, index) => {
          const userObj = {
            id: u._id,
            name: `${u.personalInfo?.firstName || "Unknown"} ${u.personalInfo?.lastName || ""}`,
            username: u.personalInfo?.firstName?.toLowerCase() || "user",
            location: u.location?.current?.city || u.location?.city || "Earth",
            country: u.location?.current?.country || "",
            photo: u.gallery?.length ? u.gallery[0] : getGradientAvatar(u),
            bio: u.personalInfo?.aboutMe || "No bio available",
            occupation: u.professionalInfo?.occupation?.replace(/_/g, " ") || "Not specified",
            education: u.professionalInfo?.education?.highestDegree || "Not specified",
            company: u.professionalInfo?.company || "",
            connectionStatus: statuses[index],
            followsYou: Math.random() > 0.7,
            mutualConnections: Math.floor(Math.random() * 10),
          };
          console.log("Formatted user object:", userObj);
          return userObj;
        });

        console.log("🔹 Setting users state now");
        setUsers(formattedUsers);
        console.log("✅ Users state updated");

      } catch (err) {
        console.error("❌ Error fetching users:", err.message);
        setUsers([]);
      } finally {
        console.log("🔹 Finished fetching users, setting loading false");
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isLoggedIn, currentuser]);








  const handleConnect = async (userId) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/user/request/chat-request/send`,
        {
          senderId: currentuser?._id || currentuser?.id,
          receiverId: userId
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Connection request sent!");
        setUsers(users.map(u =>
          u.id === userId
            ? { ...u, connectionStatus: "pending" }
            : u
        ));
      }
    } catch (err) {
      console.error("Error sending request:", err.response?.data || err.message);
      toast.error("Failed to send request");
    }
  };

  // Handle cancel request
  const handleCancelRequest = async (userId) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/api/user/request/cancel-by-user`,
        {
          senderId: currentuser?._id || currentuser?.id,
          receiverId: userId,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Request cancelled");
        setUsers(users.map(u =>
          u.id === userId
            ? { ...u, connectionStatus: "none" }
            : u
        ));
      }
    } catch (err) {
      console.error("Error cancelling request:", err.response?.data || err.message);
      toast.error("Failed to cancel request");
    }
  };

  // Handle remove suggestion
  const handleRemove = (userId) => {
    setUsers(users.filter(u => u.id !== userId));
    toast.success("Removed from suggestions");
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        user.location.toLowerCase().includes(term) ||
        user.occupation.toLowerCase().includes(term)
      );
    }

    if (filters.location && !user.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.occupation && !user.occupation.toLowerCase().includes(filters.occupation.toLowerCase())) return false;
    if (filters.education && !user.education.toLowerCase().includes(filters.education.toLowerCase())) return false;

    return true;
  });

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-xl p-4 shadow-sm animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
            </div>
            <div className="w-24 h-9 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center p-8 max-w-md w-full">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mx-auto flex items-center justify-center mb-6">
            <Users className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Discover People</h1>
          <p className="text-gray-600 mb-8">Sign in to see suggestions</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all w-full"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md  bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 ">
          <div className="flex items-center justify-between h-16  ">
            <div className="flex items-center space-x-3  ">
              <div className="relative ">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search suggestions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="
    pl-10 pr-4 py-2 rounded-full text-sm w-200
    bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900
    text-white placeholder-gray-400
    border-0 outline-none
    focus:outline-none focus:ring-2 focus:ring-purple-300

    autofill:text-white
  "
                />

              </div>
            </div>
          </div>
        </div>


      </div>



      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          renderSkeleton()
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">No suggestions found</h3>
            <p className="text-gray-500 mb-8">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="space-y-4  ">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between ">
                  {/* User Info */}
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div
                      className="relative cursor-pointer"
                      onClick={() => navigate(`/userprofile/${user.id}`)}
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <img
                          src={user.photo}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-white truncate">
                          {user.name}
                        </h3>

                      </div>

                      <p className="text-sm text-white truncate">
                        {user.location}
                      </p>

                      <div className="flex items-center space-x-3 mt-1">
                        {user.occupation !== "Not specified" && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Briefcase className="w-3 h-3" />
                            <span>{user.occupation}</span>
                          </div>
                        )}

                        {user.education !== "Not specified" && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <GraduationCap className="w-3 h-3" />
                            <span>{user.education}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-purple-600 mt-2">
                        {user.suggestionReason}
                      </p>
                    </div>
                  </div>




                  <div className="relative flex items-center space-x-2 ml-4">

                    {/* Connection Buttons */}
                    {user.connectionStatus === "none" && (
                      <button
                        onClick={() => handleConnect(user.id)}
                        className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-md transition"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Connect</span>
                      </button>
                    )}

                    {user.connectionStatus === "pending" && (
                      <button
                        onClick={() => handleCancelRequest(user.id)}
                        className="flex items-center space-x-1 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium border border-amber-200"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Requested</span>
                      </button>
                    )}

                    {user.connectionStatus === "accepted" && (
                      <button
                        onClick={() => navigate(`/chat/${user.id}`)}
                        className="flex items-center space-x-1 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Connected</span>
                      </button>
                    )}

                    {/* THREE DOTS BUTTON */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title="Actions"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>

                      {/* DROPDOWN MENU */}
                      {openMenu === user.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border z-50">
                          <button
                            onClick={() => navigate(`/userprofile/${user.id}`)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            View Profile
                          </button>

                          <button
                            onClick={() => handleRemove(user.id)}
                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discovery;
