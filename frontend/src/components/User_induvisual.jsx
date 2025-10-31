
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    MapPin, Briefcase, GraduationCap, Heart, MessageCircle,
    ArrowLeft, Share, Flag, Camera, Music, Utensils, BookOpen,
    Palette, Sparkles, Mountain, Users, Calendar, Cake, Zap,
    CheckCircle, X, Edit
} from "lucide-react";

import { AuthContext } from '../Context/Authcontext.js';
import toast from 'react-hot-toast';

const User_individual = () => {
    const BASE_URL = "https://shadii-com.onrender.com";
    const { reqId } = useParams();   // Target user ID from URL params
    const navigate = useNavigate();
    const { currentuser, isLoggedIn } = useContext(AuthContext);

    console.log("🎯 Target User ID:", reqId);
    console.log("👤 Current User ID:", currentuser?._id || currentuser?.id);

    // State Management
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Connection States
    const [connectionStatus, setConnectionStatus] = useState("none");
    const [requestId, setRequestId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [connectionLoading, setConnectionLoading] = useState(false);

    // Default profile photo
    const getDefaultPhoto = (gender) => {
        if (gender?.toLowerCase() === "female") return "https://placehold.co/600x600/FFB6C1/FFFFFF?text=F";
        if (gender?.toLowerCase() === "male") return "https://placehold.co/600x600/87CEEB/FFFFFF?text=M";
        return "https://placehold.co/600x600/CCCCCC/FFFFFF?text=U";
    };

    // 🟢 FETCH USER PROFILE
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!isLoggedIn) {
                setLoading(false);
                toast.error("Please login to view profiles");
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                // console.log("🔍 Fetching user profile for:", reqId);

                const res = await axios.get(`${BASE_URL}/api/user/${reqId}`, {
                    withCredentials: true,
                });

                // console.log("📦 Profile API response:", res.data);

                const userData = res.data.data?.user || res.data.data;
                if (!userData) {
                    setError("User not found");
                    setUser(null);
                    return;
                }

                // Map user data to consistent format
                const mappedUser = {
                    id: userData._id,
                    name: `${userData.personalInfo?.firstName || "Unknown"} ${userData.personalInfo?.lastName || ""}`.trim(),
                    age: calculateAge(userData.personalInfo?.dateOfBirth),
                    gender: userData.personalInfo?.gender || "Not specified",
                    location: userData.location?.city || "Earth",
                    country: userData.location?.country || "",
                    photos: userData.gallery?.length ? userData.gallery : [getDefaultPhoto(userData.personalInfo?.gender)],
                    bio: userData.aboutMe?.strengths ? userData.aboutMe.strengths.join(", ") : "No bio available",
                    interests: [...(userData.lifestyleInfo?.hobbies || []), ...(userData.lifestyleInfo?.interests || [])].filter(Boolean),
                    occupation: userData.professionalInfo?.occupation?.replace(/_/g, " ") || "Not specified",
                    education: userData.professionalInfo?.education?.highestDegree || "Not specified",
                    company: userData.professionalInfo?.company || "Not specified",
                    compatibility: Math.floor(Math.random() * 40) + 60,
                    isOnline: userData.isActive || false,
                    lastActive: userData.lastActive || "Recently active",
                    lifestyle: {
                        smoking: userData.lifestyleInfo?.smoking || "Not specified",
                        drinking: userData.lifestyleInfo?.drinking || "Not specified",
                        exercise: userData.lifestyleInfo?.exercise || "Not specified",
                        diet: userData.lifestyleInfo?.diet || "Not specified",
                    },
                    personalInfo: {
                        height: getHeightDisplay(userData.personalInfo?.height),
                        relationship: userData.personalInfo?.relationshipStatus || "Not specified",
                        children: userData.personalInfo?.children || "Not specified",
                        languages: userData.personalInfo?.languages?.length ? userData.personalInfo.languages : ["English"],
                    },
                    isCurrentUser: (currentuser?._id === userData._id) || (currentuser?.id === userData._id),
                };

                // console.log("✅ Mapped user data:", mappedUser);
                setUser(mappedUser);
                setError(null);
            } catch (err) {
                console.error("❌ Error fetching user profile:", err.response?.data || err.message);
                setError(err.response?.data?.message || "Failed to load user profile");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        if (reqId && isLoggedIn) {
            fetchUserProfile();
        }
    }, [reqId, isLoggedIn, currentuser, navigate]);

    // 🟢 FETCH CONNECTION STATUS
    useEffect(() => {
        const fetchConnectionStatus = async () => {
            if (!reqId || !isLoggedIn || (!currentuser?._id && !currentuser?.id)) {
                console.log("🚫 Skipping connection status - missing data");
                return;
            }

            try {
                setConnectionLoading(true);
                console.log("🔗 Checking connection status between:", currentuser?._id || currentuser?.id, "and", reqId);

                const res = await axios.get(
                    `${BASE_URL}/api/user/request/status`,   // very import concept   when use get and send data along withit used params
                    {
                        params: {
                            receiverId: reqId,
                            senderId: currentuser?._id || currentuser?.id
                        },
                        withCredentials: true
                    }
                );

                console.log("this is res from getstatus", res)

                console.log("📡 Connection status response:", res.data);

                if (res.data.success) {
                    setConnectionStatus(res.data.status);
                    setRequestId(res.data.requestId);
                    console.log("✅ Connection status:", res.data.status, "Request ID:", res.data.requestId);
                }
            } catch (err) {
                console.error("❌ Error fetching connection status:", err.response?.data || err.message);
                setConnectionStatus("none");
                setRequestId(null);
            } finally {
                setConnectionLoading(false);
            }
        };

        fetchConnectionStatus();
    }, [reqId, isLoggedIn, currentuser]);

    // 🟢 CALCULATE AGE
    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return null;
        try {
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        } catch (error) {
            return null;
        }
    };

    // 🟢 GET HEIGHT DISPLAY
    const getHeightDisplay = (height) => {
        if (!height) return "Not specified";
        if (typeof height === 'string') return height;
        if (typeof height === 'object' && height.value && height.unit) {
            return `${height.value} ${height.unit}`;
        }
        return "Not specified";
    };

    // 🟢 GET INTEREST ICON
    const getInterestIcon = (interest) => {
        const iconMap = {
            Hiking: Mountain, Photography: Camera, Coffee: Utensils, Travel: MapPin,
            Technology: Briefcase, Fitness: Zap, Reading: BookOpen, Cooking: Utensils,
            Dancing: Music, Yoga: Sparkles, Beach: Mountain, Music: Music, Food: Utensils,
            Writing: BookOpen, Nature: Mountain, Science: GraduationCap, Film: Camera,
            Art: Palette, Sports: Zap, Gaming: Sparkles,
        };
        return iconMap[interest] || Sparkles;
    };

    // 🟢 HANDLE CONNECT REQUEST
    const handleConnect = async () => {
        if (!reqId) {
            toast.error("User ID is missing");
            return;
        }

        try {
            setActionLoading(true);
            // console.log("📤 Sending connection request to:", reqId);

            const res = await axios.post(
                `${BASE_URL}/api/user/request/chat-request/send`,
                {
                    senderId: currentuser?._id || currentuser?.id,
                    receiverId: reqId
                },
                { withCredentials: true }
            );

            console.log("✅ Connect request response:", res.data);

            if (res.data.success) {
                toast.success("Connection request sent!");
                setConnectionStatus("pending");
                setRequestId(res.data.data?._id);

                // Refresh connection status
                const statusRes = await axios.get(
                    `${BASE_URL}/api/user/request/status`,   // very import concept   when use get and send data along withit used params
                    {
                        params: {
                            receiverId: reqId,
                            senderId: currentuser?._id || currentuser?.id
                        },
                        withCredentials: true
                    }
                );
                if (statusRes.data.success) {
                    setConnectionStatus(statusRes.data.status);
                }
            }
        } catch (err) {
            console.error("❌ Error sending request:", err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || "Failed to send connection request";
            toast.error(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    // 🟢 HANDLE CANCEL REQUEST
    const handleCancelRequest = async () => {
        try {
            setActionLoading(true);
            // console.log("🗑️ Cancelling request between:", currentuser?._id || currentuser?.id, "and", reqId);

            const response = await axios.put(
                `${BASE_URL}/api/user/request/cancel-by-user`,
                {
                    senderId: currentuser?._id || currentuser?.id,
                    receiverId: reqId
                },
                { withCredentials: true }
            );

            // console.log("✅ Cancel response:", response.data);

            if (response.data.success) {
                toast.success("Request cancelled successfully");
                setConnectionStatus("none");
                setRequestId(null);
            }
        } catch (err) {
            console.error("❌ Error cancelling request:", err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || "Failed to cancel request";
            toast.error(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    // 🟢 HANDLE ACCEPT REQUEST
    const handleAcceptRequest = async () => {
        if (!requestId) {
            toast.error("Request ID is missing");
            return;
        }

        try {
            setActionLoading(true);
            // console.log("✅ Accepting request:", requestId);

            const res = await axios.put(
                `${BASE_URL}/api/user/request/accept`,
                {
                    senderId: reqId, // The person who sent the request
                    receiverId: currentuser?._id || currentuser?.id // Current user accepting
                },
                { withCredentials: true }
            );

            // console.log("✅ Accept response:", res.data);

            if (res.data.success) {
                toast.success("Request accepted!");
                setConnectionStatus("accepted");
            }
        } catch (err) {
            console.error("❌ Error accepting request:", err.response?.data || err.message);
            toast.error(err.response?.data?.message || "Failed to accept request");
        } finally {
            setActionLoading(false);
        }
    };

    // 🟢 HANDLE REJECT REQUEST
    const handleRejectRequest = async () => {
        if (!requestId) {
            toast.error("Request ID is missing");
            return;
        }

        try {
            setActionLoading(true);
            // console.log("❌ Rejecting request:", requestId);

            const res = await axios.put(
                `${BASE_URL}/api/user/request/cancel-request`,
                {
                    senderId: reqId, // The person who sent the request
                    receiverId: currentuser?._id || currentuser?.id // Current user rejecting
                },
                { withCredentials: true }
            );

            // console.log("✅ Reject response:", res.data);

            if (res.data.success) {
                toast.success("Request rejected");
                setConnectionStatus("rejected");
            }
        } catch (err) {
            console.error("❌ Error rejecting request:", err.response?.data || err.message);
            toast.error(err.response?.data?.message || "Failed to reject request");
        } finally {
            setActionLoading(false);
        }
    };

    // 🟢 HANDLE SEND MESSAGE
    const handleSendMessage = async () => {
        if (!reqId) {
            toast.error("User ID is missing");
            return;
        }

        try {
            setActionLoading(true);
            // console.log("💬 Opening chat with:", reqId);

            // First check if we're connected
            if (connectionStatus !== "accepted") {
                toast.error("You need to be connected to message this user");
                return;
            }

            // Navigate to chat page - you'll need to implement this route
            navigate(`/chat/${reqId}`);
            toast.success("Opening chat...");

        } catch (err) {
            console.error("❌ Error starting chat:", err.response?.data || err.message);
            toast.error(err.response?.data?.message || "Failed to open chat");
        } finally {
            setActionLoading(false);
        }
    };

    // 🟢 RENDER CONNECTION BUTTONS
    const renderConnectionButtons = () => {
        // console.log("🎨 Rendering buttons - Status:", connectionStatus, "Request ID:", requestId, "Is Current User:", user?.isCurrentUser);

        // Own profile - show edit button
        if (user?.isCurrentUser) {
            return (
                <button
                    onClick={() => navigate("/edit-profile")}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                >
                    <Edit className="w-5 h-5" />
                    Edit My Profile
                </button>
            );
        }

        // Loading state
        if (connectionLoading) {
            return (
                <button
                    disabled
                    className="w-full bg-gray-200 text-gray-500 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                >
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                    Checking connection...
                </button>
            );
        }

        // Connection status based rendering
        switch (connectionStatus) {
            case "none":
                return (
                    <button
                        onClick={handleConnect}
                        disabled={actionLoading}
                        className="w-full bg-purple-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-purple-600 transition-all disabled:opacity-50"
                    >
                        {actionLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Users className="w-5 h-5" />
                        )}
                        {actionLoading ? "Sending..." : "Connect"}
                    </button>
                );

            case "pending":
                // Determine if pending request is from me or to me
                const isPendingFromMe = requestId && connectionStatus === "pending";

                if (isPendingFromMe) {
                    return (
                        <button
                            onClick={handleCancelRequest}
                            disabled={actionLoading}
                            className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50"
                        >
                            {actionLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                            ) : (
                                <X className="w-5 h-5" />
                            )}
                            {actionLoading ? "Cancelling..." : "Cancel Request"}
                        </button>
                    );
                } else {
                    return (
                        <div className="space-y-3">
                            <button
                                onClick={handleAcceptRequest}
                                disabled={actionLoading}
                                className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <CheckCircle className="w-5 h-5" />
                                )}
                                {actionLoading ? "Accepting..." : "Accept Request"}
                            </button>
                            <button
                                onClick={handleRejectRequest}
                                disabled={actionLoading}
                                className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <X className="w-5 h-5" />
                                )}
                                {actionLoading ? "Rejecting..." : "Reject Request"}
                            </button>
                        </div>
                    );
                }

            case "accepted":
                return (
                    <div className="space-y-3">
                        <button className="w-full bg-green-50 text-green-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border border-green-200">
                            <CheckCircle className="w-5 h-5" />
                            Connected
                        </button>
                        <button
                            onClick={handleSendMessage}
                            disabled={actionLoading}
                            className="w-full border border-purple-300 text-purple-700 py-3 rounded-xl font-semibold transition-all hover:bg-purple-50 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {actionLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-700"></div>
                            ) : (
                                <MessageCircle className="w-5 h-5" />
                            )}
                            {actionLoading ? "Opening..." : "Send Message"}
                        </button>
                    </div>
                );

            case "rejected":
                return (
                    <button
                        onClick={handleConnect}
                        disabled={actionLoading}
                        className="w-full bg-purple-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-purple-600 transition-all disabled:opacity-50"
                    >
                        {actionLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Users className="w-5 h-5" />
                        )}
                        {actionLoading ? "Sending..." : "Send Request Again"}
                    </button>
                );

            default:
                return (
                    <button
                        onClick={handleConnect}
                        disabled={actionLoading || connectionLoading}
                        className="w-full bg-purple-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-purple-600 transition-all disabled:opacity-50"
                    >
                        <Users className="w-5 h-5" />
                        Connect
                    </button>
                );
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
                    <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || "User profile could not be loaded"}</p>
                    <button
                        onClick={() => navigate('/discovery')}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                    >
                        Back to Discovery
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/discovery')}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <MapPin className="w-4 h-4" />
                                    <span>{user.location}, {user.country}</span>
                                    {user.isOnline ? (
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-green-500 text-sm">Online</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-sm">{user.lastActive}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {user.isCurrentUser && (
                                <button
                                    onClick={() => navigate('/edit-profile')}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit Profile
                                </button>
                            )}
                            <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                                <Share className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                                <Flag className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Photos & Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Photo Gallery */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <div className="relative">
                                <img
                                    src={user.photos[activeImageIndex]}
                                    alt={user.name}
                                    className="w-full h-96 object-cover"
                                    onError={(e) => {
                                        e.target.src = getDefaultPhoto(user.gender);
                                    }}
                                />

                                {user.photos.length > 1 && (
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {user.photos.map((photo, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setActiveImageIndex(index)}
                                                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === index ? 'border-purple-500 scale-105' : 'border-white opacity-80'
                                                        }`}
                                                >
                                                    <img
                                                        src={photo}
                                                        alt={`${user.name} ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = getDefaultPhoto(user.gender);
                                                        }}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-500" />
                                About Me
                            </h2>
                            <p className="text-gray-600 leading-relaxed">{user.bio}</p>
                        </div>

                        {/* Interests Section */}
                        {user.interests.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-500" />
                                    Interests & Hobbies
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {user.interests.map((interest, index) => {
                                        const Icon = getInterestIcon(interest);
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 px-4 py-3 rounded-xl font-medium border border-purple-100"
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span>{interest}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Profile Info & Actions */}
                    <div className="space-y-6">
                        {/* Compatibility & Actions */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-3">
                                    <Heart className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-gray-800 mb-1">{user.compatibility}%</div>
                                <div className="text-gray-500">Compatibility Score</div>
                            </div>

                            <div className="space-y-3">
                                {renderConnectionButtons()}
                            </div>
                        </div>

                        {/* Personal Details */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Personal Details</h3>
                            <div className="space-y-3">
                                {user.age && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Cake className="w-5 h-5 text-purple-500" />
                                        <span>{user.age} years old</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Users className="w-5 h-5 text-purple-500" />
                                    <span className="capitalize">{user.gender}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Calendar className="w-5 h-5 text-purple-500" />
                                    <span className="capitalize">{user.personalInfo.relationship}</span>
                                </div>
                                {user.personalInfo.height !== "Not specified" && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Zap className="w-5 h-5 text-purple-500" />
                                        <span>{user.personalInfo.height}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Professional Info */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Professional</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Briefcase className="w-5 h-5 text-purple-500" />
                                    <span className="capitalize">{user.occupation}</span>
                                </div>
                                {user.company !== "Not specified" && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Briefcase className="w-5 h-5 text-purple-500" />
                                        <span>{user.company}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-gray-600">
                                    <GraduationCap className="w-5 h-5 text-purple-500" />
                                    <span>{user.education}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default User_individual;
