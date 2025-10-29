



import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    MapPin,
    Briefcase,
    GraduationCap,
    Heart,
    MessageCircle,
    ArrowLeft,
    Share,
    Flag,
    Camera,
    Music,
    Utensils,
    BookOpen,
    Palette,
    Sparkles,
    Mountain,
    Users,
    Calendar,
    Cake,
    Zap,
    CheckCircle,
    X,
    Edit
} from "lucide-react";

import { AuthContext } from '../Context/Authcontext.js';

const User_individual = () => {
        const BASE_URL = "https://shadii-com.onrender.com";
    const { userId } = useParams();
    const navigate = useNavigate();
    const { currentuser, isLoggedIn } = useContext(AuthContext);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState("none");

    const getDefaultPhoto = (gender) => {
        if (gender?.toLowerCase() === "female") return "https://placehold.co/600x600/FFB6C1/FFFFFF?text=F";
        if (gender?.toLowerCase() === "male") return "https://placehold.co/600x600/87CEEB/FFFFFF?text=M";
        return "https://placehold.co/600x600/CCCCCC/FFFFFF?text=U";
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!isLoggedIn) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const res = await axios.get(`${BASE_URL}/api/user/${userId}`, {
                    withCredentials: true,
                });

                // console.log("API Response:", res);

                const userData = res.data.data?.user;
                if (!userData) {
                    setError("User not found");
                    setUser(null);
                    return;
                }

                // console.log("User data:", userData);

                // Helper function to safely handle height object
                const getHeightDisplay = (height) => {
                    if (!height) return "Not specified";
                    if (typeof height === 'string') return height;
                    if (typeof height === 'object' && height.value && height.unit) {
                        return `${height.value} ${height.unit}`;
                    }
                    return "Not specified";
                };

                // Helper function to safely handle bio/strengths
                const getBioDisplay = (aboutMe) => {
                    if (!aboutMe) return "No bio available";
                    if (typeof aboutMe === 'string') return aboutMe;
                    if (aboutMe.strengths && Array.isArray(aboutMe.strengths)) {
                        return aboutMe.strengths.join(", ");
                    }
                    return "No bio available";
                };

                const mappedUser = {
                    id: userData._id,
                    name: `${userData.personalInfo?.firstName || "Unknown"} ${userData.personalInfo?.lastName || ""}`.trim(),
                    age: calculateAge(userData.personalInfo?.dateOfBirth),
                    gender: userData.personalInfo?.gender || "Not specified",
                    location: userData.location?.city || "Earth",
                    country: userData.location?.country || "",
                    photos: userData.gallery?.length ? userData.gallery : [getDefaultPhoto(userData.personalInfo?.gender)],
                    bio: getBioDisplay(userData.aboutMe),
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
                    contactInfo: {
                        email: userData.email || "Not available",
                        phone: userData.phone || "Not available",
                    },
                    isCurrentUser: currentuser?._id === userData._id,
                };

                // console.log("Mapped user:", mappedUser);
                setUser(mappedUser);
            } catch (err) {
                console.error("Error fetching user profile:", err.message);
                setError("Failed to load user profile");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserProfile();
        }
    }, [userId, isLoggedIn, currentuser]);

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

    const getInterestIcon = (interest) => {
        const iconMap = {
            Hiking: Mountain,
            Photography: Camera,
            Coffee: Utensils,
            Travel: MapPin,
            Technology: Briefcase,
            Fitness: Zap,
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
            Sports: Zap,
            Gaming: Sparkles,
        };
        return iconMap[interest] || Sparkles;
    };

    const handleConnect = async () => {
        try {



            const res = await axios.post(
                `${BASE_URL}/api/user/request/chat-request/send`,
                { receiverId: userId },
                { withCredentials: true } // <--- this is important
            );

            console.log(res);

            if (res.data.success) {
                setConnectionStatus("pending");
            }
        } catch (err) {
            console.error("Error sending connection request:", err.response?.data || err.message);
            alert("Failed to send connection request");
        }
    };

    const handleCancelRequest = async () => {
        try {
            setConnectionStatus("none");
        } catch (err) {
            console.error("Error cancelling request:", err.response?.data || err.message);
        }
    };



    useEffect(() => {
        const fetchConnectionStatus = async () => {
            if (!userId || !isLoggedIn) return;

            try {
                const res = await axios.get(`${BASE_URL}/api/user/request/status/${userId}`, {
                    withCredentials: true,
                });
                if (res.data.success) {
                    setConnectionStatus(res.data.status);
                }
            } catch (err) {
                console.error("Error fetching connection status:", err.response?.data || err.message);
            }
        };

        fetchConnectionStatus();
    }, [userId, isLoggedIn]);



const handleSendMessage = async () => {
  try {
    const res = await axios.post(
      `${BASE_URL}/api/chat/start/${userId}`,
      {},
      { withCredentials: true }
    );

    if (res.data.success) {
      const chatId = res.data.data._id;
      navigate(`/chat/${userId}`); // navigate to chat room
    }
  } catch (err) {
    console.error("Error starting chat:", err);
    alert("Failed to open chat");
  }
};


    // console.log("coonection status", connectionStatus);

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Required</h2>
                    <p className="text-gray-600 mb-6">Please login to view user profiles</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

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

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Photos & Basic Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Main Photo Gallery */}
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

                                {/* Image Gallery */}
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
                                {!user.isCurrentUser ? (
                                    <>
                                        {connectionStatus === "none" && (
                                            <button
                                                onClick={handleConnect}
                                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                                Send Connection Request
                                            </button>
                                        )}

                                        {connectionStatus === "pending" && (
                                            <button
                                                onClick={handleCancelRequest}
                                                className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition-all border border-red-200"
                                            >
                                                <X className="w-5 h-5" />
                                                Cancel Request
                                            </button>
                                        )}

                                        {connectionStatus === "connected" && (
                                            <button className="w-full bg-green-50 text-green-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border border-green-200">
                                                <CheckCircle className="w-5 h-5" />
                                                Connected
                                            </button>
                                        )}

                                        <button
                                            onClick={handleSendMessage}
                                            disabled={connectionStatus !== "accepted"}
                                            className={`w-full border py-3 rounded-xl font-semibold transition-all ${connectionStatus === "accepted"
                                                    ? "border-purple-300 text-purple-700 hover:bg-purple-50"
                                                    : "border-gray-300 text-gray-400 cursor-not-allowed"
                                                }`}
                                        >
                                            Send Message
                                        </button>

                                    </>
                                ) : (
                                    <button
                                        onClick={() => navigate('/edit-profile')}
                                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                                    >
                                        <Edit className="w-5 h-5" />
                                        Edit My Profile
                                    </button>
                                )}
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

                        {/* Lifestyle */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Lifestyle</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Smoking</span>
                                    <span className="font-medium capitalize">{user.lifestyle.smoking}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Drinking</span>
                                    <span className="font-medium capitalize">{user.lifestyle.drinking}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Exercise</span>
                                    <span className="font-medium capitalize">{user.lifestyle.exercise}</span>
                                </div>
                                {user.lifestyle.diet !== "Not specified" && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Diet</span>
                                        <span className="font-medium capitalize">{user.lifestyle.diet}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Languages */}
                        {user.personalInfo.languages.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Languages</h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.personalInfo.languages.map((language, index) => (
                                        <span
                                            key={index}
                                            className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium border border-blue-100"
                                        >
                                            {language}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default User_individual;
