


import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    MapPin, Briefcase, GraduationCap, Heart, MessageCircle,
    ArrowLeft, Share, Flag, Camera, Music, Utensils, BookOpen,
    Palette, Sparkles, Mountain, Users, Calendar, Cake, Zap,
    CheckCircle, X, Edit, Star, Award, Clock, Phone, Video,
    Mail, Gift, Home, Car, Globe, Coffee, Palette as ArtIcon,
    Smile, Target, Leaf, Dumbbell
} from "lucide-react";

import { AuthContext } from '../Context/Authcontext.js';
import toast from 'react-hot-toast';



const FriendItem = ({ friend, closeList }) => {
    const navigate = useNavigate();

    const openProfile = () => {
        closeList(); // close the list
        navigate(`/userprofile/${friend.id}`);
        window.location.reload(); // reload page
    };

    return (
        <div className="flex items-center justify-between bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-3 rounded-lg">
            <div
                onClick={openProfile}
                className="flex items-center gap-3 cursor-pointer"
            >
                <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-sm font-medium">
                    {friend.name}
                </span>
            </div>
        </div>
    );
};

const User_individual = () => {

    const BASE_URL = "https://shadii-com.onrender.com";
    const { reqId } = useParams();

    // console.log("thsi si suserid params-/***************************------------", reqId);
    const navigate = useNavigate();
    const { currentuser, isLoggedIn } = useContext(AuthContext);

    // State Management
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mutual Friends
    const [mutualFriends, setMutualFriends] = useState([]);
    const [mutualCount, setMutualCount] = useState(0);
    const [showMutualModal, setShowMutualModal] = useState(false);
    const [mutualLoading, setMutualLoading] = useState(false);
    const [friends, setFriends] = useState([]);
    const [loadingfriend, setLoadingfriend] = useState(true);
    const [showFriends, setShowFriends] = useState(false);


    // Connection States
    const [connectionStatus, setConnectionStatus] = useState("none");
    const [requestId, setRequestId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [connectionLoading, setConnectionLoading] = useState(false);

    // Enhanced default photos
    const getDefaultPhoto = (gender) => {
        if (gender?.toLowerCase() === "female") return "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80";
        if (gender?.toLowerCase() === "male") return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80";
        return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80";
    };





    // fetcgh only the length of frends means hoeww many frends 
    console.log("this is res-------------------------", reqId);
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                setLoadingfriend(true);
                const res = await axios.get(`${BASE_URL}/api/user/request/friends/${reqId}`, {
                    withCredentials: true,
                });





                if (res.data.success) {
                    // Handle both array and object responses
                    const friendsData = res.data.friends || [];
                    if (friendsData.length === 0) {
                        setFriends([]);
                        return;
                    }
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
                setLoadingfriend(false);
            }
        };

        if (isLoggedIn) {
            fetchFriends();
        } else {
            setLoadingfriend(false);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (currentuser && reqId) {
            fetchMutualFriends();
        }
    }, [currentuser, reqId]);

    // Enhanced user data with dummy data
    const enhanceUserData = (userData) => {
        const dummyFamilyInfo = {
            familyStatus: "Respected",
            familyType: "Nuclear",
            familyValues: "Traditional",
            fatherOccupation: "Business",
            motherOccupation: "Homemaker",
            siblings: "1 Brother, 1 Sister"
        };

        const dummyPartnerPreferences = {
            ageRange: "25-30",
            height: "5'4\" - 6'0\"",
            education: "Graduate",
            occupation: "Professional",
            location: "Any Metro City"
        };

        return {
            id: userData._id,
            name: `${userData.personalInfo?.firstName || "Unknown"} ${userData.personalInfo?.lastName || ""}`.trim(),
            age: calculateAge(userData.personalInfo?.dateOfBirth),
            gender: userData.personalInfo?.gender || "Not specified",
            location: userData.location?.city || "Earth",
            country: userData.location?.country || "",
            photos: userData.gallery?.length ? userData.gallery : [getDefaultPhoto(userData.personalInfo?.gender)],
            bio: userData.aboutMe?.strengths ? userData.aboutMe.strengths.join(", ") : "A kind-hearted person looking for a meaningful relationship. Family-oriented with modern values.",
            interests: [...(userData.lifestyleInfo?.hobbies || []), ...(userData.lifestyleInfo?.interests || [])].filter(Boolean),
            occupation: userData.professionalInfo?.occupation?.replace(/_/g, " ") || "Software Engineer",
            education: userData.professionalInfo?.education?.highestDegree || "Masters Degree",
            company: userData.professionalInfo?.company || "Tech Company Inc.",
            compatibility: Math.floor(Math.random() * 40) + 60,
            isOnline: userData.isActive || false,
            lastActive: userData.lastActive || "Recently active",

            // Enhanced personal info
            personalInfo: {
                height: getHeightDisplay(userData.personalInfo?.height) || "5'8\"",
                relationship: userData.personalInfo?.relationshipStatus || "Never Married",
                children: userData.personalInfo?.children || "No",
                languages: userData.personalInfo?.languages?.length ? userData.personalInfo.languages : ["English", "Hindi"],
                religion: userData.personalInfo?.religion || "Hindu",
                caste: userData.personalInfo?.caste || "Not specified",
                manglik: userData.personalInfo?.manglik || "No"
            },

            // Enhanced lifestyle
            lifestyle: {
                smoking: userData.lifestyleInfo?.smoking || "Non-smoker",
                drinking: userData.lifestyleInfo?.drinking || "Occasionally",
                exercise: userData.lifestyleInfo?.exercise || "Regularly",
                diet: userData.lifestyleInfo?.diet || "Vegetarian",
            },

            // Enhanced professional info
            professionalInfo: {
                annualIncome: userData.professionalInfo?.annualIncome || "₹ 10-15 LPA",
                educationDetail: userData.professionalInfo?.educationDetail || "Masters in Computer Science",
                workingWith: userData.professionalInfo?.workingWith || "MNC"
            },

            // New sections
            familyInfo: dummyFamilyInfo,
            partnerPreferences: dummyPartnerPreferences,

            // Additional enhanced data
            about: {
                personality: ["Friendly", "Ambitious", "Family-oriented", "Creative"],
                strengths: ["Good Listener", "Positive Thinker", "Supportive Partner"],
                lookingFor: "A caring and understanding life partner who values family and personal growth"
            },

            isCurrentUser: (currentuser?._id === userData._id) || (currentuser?.id === userData._id),
        };
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
                const res = await axios.get(`${BASE_URL}/api/user/${reqId}`, {
                    withCredentials: true,
                });

                const userData = res.data.data?.user || res.data.data;
                if (!userData) {
                    setError("User not found");
                    setUser(null);
                    return;
                }

                const mappedUser = enhanceUserData(userData);
                setUser(mappedUser);
                setError(null);
            } catch (err) {
                console.error("❌ Error fetching user profile:", err);
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
            if (!reqId || !isLoggedIn || (!currentuser?._id && !currentuser?.id)) return;

            try {
                setConnectionLoading(true);
                const res = await axios.get(
                    `${BASE_URL}/api/user/request/status`,
                    {
                        params: {
                            receiverId: reqId,
                            senderId: currentuser?._id || currentuser?.id
                        },
                        withCredentials: true
                    }
                );

                if (res.data.success) {
                    setConnectionStatus(res.data.status);
                    setRequestId(res.data.requestId);
                }
            } catch (err) {
                console.error("❌ Error fetching connection status:", err);
                setConnectionStatus("none");
                setRequestId(null);
            } finally {
                setConnectionLoading(false);
            }
        };

        fetchConnectionStatus();
    }, [reqId, isLoggedIn, currentuser]);

    // Helper functions
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

    const getHeightDisplay = (height) => {
        if (!height) return "Not specified";
        if (typeof height === 'string') return height;
        if (typeof height === 'object' && height.value && height.unit) {
            return `${height.value} ${height.unit}`;
        }
        return "Not specified";
    };

    const getInterestIcon = (interest) => {
        const iconMap = {
            Hiking: Mountain, Photography: Camera, Coffee: Coffee, Travel: Globe,
            Technology: Briefcase, Fitness: Dumbbell, Reading: BookOpen, Cooking: Utensils,
            Dancing: Music, Yoga: Leaf, Beach: Mountain, Music: Music, Food: Utensils,
            Writing: BookOpen, Nature: Mountain, Science: GraduationCap, Film: Camera,
            Art: ArtIcon, Sports: Dumbbell, Gaming: Sparkles,
        };
        return iconMap[interest] || Sparkles;
    };

    // Connection handlers
    const handleConnect = async () => {
        if (!reqId) {
            toast.error("User ID is missing");
            return;
        }
        try {
            setActionLoading(true);
            const res = await axios.post(
                `${BASE_URL}/api/user/request/chat-request/send`,
                {
                    senderId: currentuser?._id || currentuser?.id,
                    receiverId: reqId
                },
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success("Connection request sent!");
                setConnectionStatus("pending");
                setRequestId(res.data.data?._id);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send connection request");
        } finally {
            setActionLoading(false);
        }
    };


    const fetchMutualFriends = async () => {
        if (!currentuser || !reqId) return;

        try {
            setMutualLoading(true);

            const res = await axios.get(
                `${BASE_URL}/api/mutual/mutual-friends/${currentuser?._id || currentuser?.id}/${reqId}`,
                { withCredentials: true }
            );

            // console.log("this is respose get from mutaul--------------------", res);

            if (res.data?.success) {
                setMutualFriends(res.data.mutualFriends || []);
                setMutualCount(res.data.mutualCount || 0);
            }
        } catch (err) {
            console.error("❌ Mutual friends error:", err);
        } finally {
            setMutualLoading(false);
        }
    };


    const handleCancelRequest = async () => {
        try {
            setActionLoading(true);
            const response = await axios.put(
                `${BASE_URL}/api/user/request/cancel-by-user`,
                {
                    senderId: currentuser?._id || currentuser?.id,
                    receiverId: reqId
                },
                { withCredentials: true }
            );
            if (response.data.success) {
                toast.success("Request cancelled successfully");
                setConnectionStatus("none");
                setRequestId(null);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to cancel request");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAcceptRequest = async () => {
        if (!requestId) {
            toast.error("Request ID is missing");
            return;
        }
        try {
            setActionLoading(true);
            const res = await axios.put(
                `${BASE_URL}/api/user/request/accept`,
                {
                    senderId: reqId,
                    receiverId: currentuser?._id || currentuser?.id
                },
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success("Request accepted!");
                setConnectionStatus("accepted");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to accept request");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectRequest = async () => {
        if (!requestId) {
            toast.error("Request ID is missing");
            return;
        }
        try {
            setActionLoading(true);
            const res = await axios.put(
                `${BASE_URL}/api/user/request/cancel-request`,
                {
                    senderId: reqId,
                    receiverId: currentuser?._id || currentuser?.id
                },
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success("Request rejected");
                setConnectionStatus("rejected");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reject request");
        } finally {
            setActionLoading(false);
        }
    };




    //    start voice call from here

    const startVoiceCall = async () => {
        console.log("📞 Start voice call clicked");

        // Validate - CRITICAL FIX
        const currentUserId = currentuser?._id || currentuser?.id;
        if (!currentUserId) {
            console.error("❌ Current user ID not found");
            alert("Please login again");
            return;
        }

        // VALIDATE selectedFriendId - THIS WAS MISSING!
        const friendId = reqId;
        if (!friendId) {
            console.error("❌ No friend selected");
            // alert("Please select a friend to call");
            return;
        }

        // Generate call ID - Now friendId won't be null
        const callId = `call_${Date.now()}_${currentUserId}_${friendId}`;

        console.log("📞 Preparing call:", {
            from: currentUserId,
            to: friendId,
            callId
        });

        try {
            // Connect socket if not connected
            if (!socket.isConnected) {
                console.log("🔌 Connecting socket...");
                await socket.connect(currentUserId);
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // Prepare navigation data
            const navigationData = {
                callType: 'outgoing',
                remoteUserId: friendId,
                remoteUserName: 'Friend'
            };

            // Store in session storage
            sessionStorage.setItem('callData', JSON.stringify({
                callId,
                from: currentUserId,
                to: friendId,
                timestamp: Date.now()
            }));

            // Navigate first
            console.log("🚀 Navigating to call interface");
            navigate(`/VoiceCall/${callId}/${currentUserId}`, {
                state: navigationData
            });

        } catch (error) {
            console.error("❌ Error starting call:", error);
            alert("Failed to start call. Please try again.");
        }
    };


    const handleSendMessage = async () => {
        if (!reqId) {
            toast.error("User ID is missing");
            return;
        }
        try {
            setActionLoading(true);
            if (connectionStatus !== "accepted") {
                toast.error("You need to be connected to message this user");
                return;
            }
            navigate(`/chat/${reqId}`);
            toast.success("Opening chat...");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to open chat");
        } finally {
            setActionLoading(false);
        }
    };

    // 🟢 RENDER CONNECTION BUTTONS
    const renderConnectionButtons = () => {
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

        if (connectionLoading) {
            return (
                <button
                    disabled
                    className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                >
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                    Checking...
                </button>
            );
        }

        switch (connectionStatus) {
            case "none":
                return (
                    <button
                        onClick={handleConnect}
                        disabled={actionLoading}
                        className="w-full  bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
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
                const isPendingFromMe = requestId && connectionStatus === "pending";
                if (isPendingFromMe) {
                    return (
                        <button
                            onClick={handleCancelRequest}
                            disabled={actionLoading}
                            className="w-full bg-gradient-to-r from-red-400 to-pink-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {actionLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <CheckCircle className="w-5 h-5" />
                                )}
                                Accept Request
                            </button>
                            <button
                                onClick={handleRejectRequest}
                                disabled={actionLoading}
                                className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <X className="w-5 h-5" />
                                )}
                                Reject Request
                            </button>
                        </div>
                    );
                }

            case "accepted":
                return (
                    <div className="space-y-3">
                        <button
                            className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Connected
                        </button>
                        <button
                            onClick={handleSendMessage}
                            disabled={actionLoading}
                            className="w-full border-2 border-purple-400 text-purple-600 py-3 rounded-xl font-semibold transition-all hover:bg-purple-50 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Send Message
                        </button>


                        <div className="grid grid-cols-2 gap-3 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
                            <button
                                className="p-3 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                <Phone className="w-6 h-6 mx-auto text-red-600" />
                            </button>
                            <button className="p-3 bg-purple-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
                                <Video className="w-6 h-6 mx-auto text-red-600" />
                            </button>

                        </div>



                    </div>
                );

            default:
                return (
                    <button
                        onClick={handleConnect}
                        disabled={actionLoading || connectionLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
                    <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || "User profile could not be loaded"}</p>
                    <button
                        onClick={() => navigate('/discover')}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                    >
                        Back to Discovery
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen  bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/discover')}
                        className="flex items-center gap-2 text-white hover:text-white-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                   
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Header Card */}
                        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-2xl shadow-sm p-8  border-gray-100">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-4">
                                        <h1 className="text-3xl font-bold text-white-800">{user.name}</h1>
                                        {/* {user.isOnline && (
                                            <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-green-900 text-sm font-medium">Online</span>
                                            </div>
                                        )} */}
                                    </div>

                                    <div className="flex items-center  gap-6 text-white-600 mb-6">
                                        {mutualCount > 0 && (
                                            <div
                                                onClick={() => setShowMutualModal(true)}
                                                className="flex items-center gap-2 cursor-pointer mt-2"
                                            >
                                                {/* Images */}
                                                <div className="flex -space-x-2 ">
                                                    {mutualFriends.slice(0, 3).map((mf, index) => (
                                                        <img
                                                            key={mf._id}
                                                            src={mf.photo || getDefaultPhoto(mf.gender)}
                                                            alt={mf.firstName}
                                                            className="w-7 h-7 rounded-full  border-white object-cover"
                                                            style={{ zIndex: 10 - index }}
                                                        />
                                                    ))}
                                                </div>

                                                {/* Count */}
                                                <span className="text-sm text-white">
                                                    {mutualCount} mutual friends
                                                </span>
                                            </div>
                                        )}





                                        {showMutualModal && (
                                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50  backdrop-blur-sm">

                                                <div className="w-[420px] max-h-[75vh] bg-gradient-to-br from-slate-600 via-purple-600 to-slate-900 text-white rounded-2xl shadow-2xl flex flex-col">
                                                    {/* Header */}
                                                    <div className="flex items-center justify-between px-5 py-4 ">
                                                        <h3 className="text-lg font-semibold text-white-800">
                                                            Mutual Friends
                                                            <span className="ml-2 text-sm text-white-500">
                                                                ({mutualCount})
                                                            </span>
                                                        </h3>

                                                        <button
                                                            onClick={() => setShowMutualModal(false)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full 
                     hover:bg-gray-100 text-white-500 hover:text-gray-700 transition"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">

                                                        {mutualLoading ? (
                                                            <div className="py-10 text-center text-gray-500 text-sm">
                                                                Loading mutual friends...
                                                            </div>
                                                        ) : mutualFriends.length === 0 ? (
                                                            <div className="py-10 text-center text-gray-500 text-sm">
                                                                No mutual friends found
                                                            </div>
                                                        ) : (
                                                            mutualFriends.map((friend) => (
                                                                <div
                                                                    key={friend._id}
                                                                    className="flex items-center gap-3 p-2 rounded-xl
                         hover:bg-gray-100 cursor-pointer transition"
                                                                >
                                                                    <img
                                                                        src={friend.photo || getDefaultPhoto(friend.gender)}
                                                                        alt={friend.firstName}
                                                                        className="w-11 h-11 rounded-full object-cover border"
                                                                    />

                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-900">
                                                                            {friend.firstName} {friend.lastName}
                                                                        </p>
                                                                        <p className="text-xs text-gray-900">
                                                                            View profile
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}

                                                    </div>
                                                </div>
                                            </div>
                                        )}






                                        {showFriends && (
                                            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

                                                <div className="bg-gray-900 w-[400px] rounded-xl p-4">






                                                    {/* Header */}
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h2 className="text-white text-lg font-semibold">
                                                            Friends ({friends.length})
                                                        </h2>
                                                        <button
                                                            onClick={() => setShowFriends(false)}
                                                            className="text-gray-400 hover:text-white"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>

                                                    {/* Friends List */}
                                                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                                        {friends.map((friend) => (
                                                            <FriendItem key={friend.id} friend={friend} closeList={() => setShowFriends(false)} />
                                                        ))}
                                                    </div>

                                                </div>
                                            </div>
                                        )}



                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-purple-500" />
                                            <span>{user.location}, {user.country}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Cake className="w-4 h-4 text-purple-500" />
                                            <span>{user.age} years</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-purple-500" />
                                            <span className="capitalize">{user.gender}</span>
                                        </div>

                                        <div
                                            onClick={() => setShowFriends(true)}
                                            className="cursor-pointer flex items-center gap-2"
                                        >
                                            <span className="text-white">
                                                { }   Friends ({friends.length})
                                            </span>
                                        </div>

                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-3 gap-4   mb-6">
                                        <div className="text-center p-4  rounded-xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
                                            <div className="text-2xl font-bold text-white-600">{user.compatibility}%</div>
                                            <div className="text-sm text-white-500">Match</div>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 rounded-xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
                                            <div className="text-2xl font-bold text-white-600">{user.interests.length}</div>
                                            <div className="text-sm text-white-500">Interests</div>
                                        </div>
                                        <div className="text-center p-4 bg-pink-50 rounded-xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
                                            <div className="text-2xl font-bold text-white">4.8</div>
                                            <div className="text-sm text-white">Rating</div>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <p className="text-white-700 leading-relaxed mb-6">{user.bio}</p>

                                    {/* Looking For */}
                                    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-xl p-4 border-blue-100">
                                        <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                            <Target className="w-4 h-4 text-white" />
                                            <span className="text-white">Looking For</span>
                                        </h3>
                                        <p className="text-white text-sm">{user.about.lookingFor}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Details */}
                        <div className=" rounded-2xl shadow-sm p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                <Smile className="w-6 h-6 text-white" />
                                <span className="text-white">Personal Details</span>
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 ">
                                <div className="p-3 rounded-lg bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
                                    <div className="text-sm text-white-500">Relationship Status</div>
                                    <div className="font-semibold text-white">{user.personalInfo.relationship}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
                                    <div className="text-sm text-white">Height</div>
                                    <div className="font-semibold text-white">{user.personalInfo.height}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
                                    <div className="text-sm text-white">Religion</div>
                                    <div className="font-semibold text-white">{user.personalInfo.religion}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
                                    <div className="text-sm text-white-500">Languages</div>
                                    <div className="font-semibold text-white-800">{user.personalInfo.languages.join(", ")}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
                                    <div className="text-sm text-white">Children</div>
                                    <div className="font-semibold text-white-800">{user.personalInfo.children}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
                                    <div className="text-sm text-white">Manglik</div>
                                    <div className="font-semibold text-white">{user.personalInfo.manglik}</div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Info */}
                        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-2xl shadow-sm p-6  border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                <Briefcase className="w-6 h-6 text-white" />
                                <span className="text-white">Professional Information</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                                <div className="space-y-4 ">
                                    <div className="flex justify-between items-center p-3 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-lg">
                                        <span className="text-white-600">Occupation</span>
                                        <span className="font-semibold text-white-700">{user.occupation}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-lg">
                                        <span className="text-white">Education</span>
                                        <span className="font-semibold text-white-700">{user.education}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-lg">
                                        <span className="text-white">Company</span>
                                        <span className="font-semibold text-white">{user.company}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-3 bg-blue-50 rounded-lg">
                                        <span className="text-white">Annual Income</span>
                                        <span className="font-semibold text-white-700">{user.professionalInfo.annualIncome}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interests */}
                        {user.interests.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 text-pink-500" />
                                    Interests & Hobbies
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {user.interests.map((interest, index) => {
                                        const Icon = getInterestIcon(interest);
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 bg-gradient-to-r from-pink-50 to-purple-50 text-purple-700 px-4 py-2 rounded-lg font-medium border border-purple-100"
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span>{interest}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Lifestyle */}
                        <div className="bg-white rounded-2xl shadow-sm p-6  bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                <Leaf className="w-6 h-6 text-green-500" />
                                <span className="text-white">Life Style</span>
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4  gap-4">
                                {Object.entries(user.lifestyle).map(([key, value]) => (
                                    <div key={key} className="text-center p-4 bg-white bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-xl">
                                        <div className="font-semibold text-white-700 capitalize text-sm mb-1">
                                            {key}
                                        </div>
                                        <div className="text-white-600 font-medium">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Profile Image & Actions */}
                    <div className="space-y-6">
                        {/* Profile Image */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white border-gray-100">
                            <div className="text-center">
                                <div className="relative inline-block mb-4">
                                    <img
                                        src={user.photos[0]}
                                        alt={user.name}
                                        className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                                        onError={(e) => {
                                            e.target.src = getDefaultPhoto(user.gender);
                                        }}
                                    />
                                    {user.isOnline && (
                                        <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>

                                {/* Star Rating */}
                                <div className="flex justify-center gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-5 h-5 ${star <= 4
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Connection Status */}
                                <div className="mb-6">
                                    {renderConnectionButtons()}
                                </div>

                                {/* Quick Actions */}

                            </div>
                        </div>

                        {/* Family Info */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white border-gray-100">
                            <h3 className="text-lg font-bold text-white-800 mb-4">Family Background</h3>
                            <div className="space-y-3">
                                {Object.entries(user.familyInfo).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center text-sm">
                                        <span className="text-white-600 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                                        </span>
                                        <span className="font-medium text-white-800">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Partner Preferences */}
                        <div className="bg-white rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white shadow-sm p-6  border-gray-100">
                            <h3 className="text-lg font-bold text-white-800 mb-4">Partner Preferences</h3>
                            <div className="space-y-3">
                                {Object.entries(user.partnerPreferences).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center text-sm">
                                        <span className="text-white-600 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                                        </span>
                                        <span className="font-medium text-white-800">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>


    );


};

export default User_individual;
