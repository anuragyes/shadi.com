import { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  Users,
  Clock,
  MessageCircle,
  Mail,
  Calendar,
  Search,
  Check,
  User,
  X,
  MapPin,
  Loader
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from '../Context/Authcontext.js';
const IncomingRequests = () => {
  const BASE_URL = "https://shadii-com.onrender.com";
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const { currentuser } = useContext(AuthContext);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const userId = currentuser?.id || currentuser?._id;

        if (!userId) {
          console.error("No user ID found");
          setLoading(false);
          return;
        }

        // console.log("🔄 Fetching requests for user:", userId);

        const res = await axios.get(
          `${BASE_URL}/api/user/request/incoming/${userId}`,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        // console.log("📦 API Response:", res.data);

        if (res.data && res.data.success) {
          setRequests(res.data.requests || []);
          // console.log("✅ Requests set:", res.data.requests);
        } else {
          toast.error(res.data?.message || "Failed to load requests");
          setRequests([]);
        }
      } catch (err) {
        console.error("❌ Error fetching requests:", err);
        if (err.response) {
          console.error("📊 Response error:", err.response.data);
          toast.error(err.response.data?.message || "Failed to load requests");
        } else if (err.request) {
          console.error("🌐 No response received");
          toast.error("No response from server");
        } else {
          console.error("⚡ Request setup error:", err.message);
          toast.error("Request failed");
        }
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentuser) {
      fetchRequests();
    } else {
      setLoading(false);
    }
  }, [currentuser]);

  const handleAccept = async (requestId, senderId) => {
    setActionLoading(requestId);
    try {
      // console.log("✅ Accepting request:", requestId, "from sender:", senderId);

      const res = await axios.put(
        `${BASE_URL}/api/user/request/accept`,
        {
          receiverId: currentuser?.id || currentuser?._id,
          senderId: senderId
        },
        {
          withCredentials: true,
        }
      );

      // console.log("📨 Accept response:", res);

      if (res.data && res.data.success) {
        toast.success("Request accepted successfully!");
        setRequests(prev => prev.filter(req => req.requestId !== requestId));
      } else {
        toast.error(res.data?.message || "Failed to accept request");
      }
    } catch (err) {
      console.error("❌ Error accepting request:", err);
      if (err.response) {
        console.error("📊 Response error:", err.response.data);
        toast.error(err.response.data?.message || "Failed to accept request");
      } else {
        toast.error("Network error while accepting request");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId, senderId) => {
    setActionLoading(requestId);
    try {
      // console.log("❌ Rejecting request:", requestId, "from sender:", senderId);

      const res = await axios.put(
        `${BASE_URL}/api/user/request/cancel-by-user`,
        {
          receiverId: currentuser?.id || currentuser?._id,
          senderId: senderId
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      // console.log("📨 Reject response:", res.data);

      if (res.data && res.data.success) {
        toast.success("Request rejected successfully!");
        setRequests(prev => prev.filter(req => req.requestId !== requestId));
      } else {
        toast.error(res.data?.message || "Failed to reject request");
      }
    } catch (err) {
      console.error("❌ Error rejecting request:", err);
      if (err.response) {
        console.error("📊 Response error:", err.response.data);
        toast.error(err.response.data?.message || "Failed to reject request");
      } else {
        toast.error("Network error while rejecting request");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const getInitials = (personalInfo) => {
    if (!personalInfo) return "U";
    const firstName = personalInfo.firstName || '';
    const lastName = personalInfo.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter requests based on sender name or email
  const filteredRequests = requests.filter(req => {
    if (!searchTerm) return true;

    const searchableText = [
      req.sender?.personalInfo?.firstName || '',
      req.sender?.personalInfo?.lastName || '',
      req.sender?.email || '',
      req.sender?._id || ''
    ].join(' ').toLowerCase();

    return searchableText.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900">Loading requests</h3>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-700 via-purple-900 to-slate-900 text-white  border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 ">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white-900">Connection Requests</h1>
                <p className="text-white text-sm mt-1">
                  {requests.length} incoming request{requests.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md  ">
              <div className="relative ">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 " />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3   rounded-lg focus:ring-2 focus:ring-blue-500 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-xl  p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-white-900">{requests.length}</div>
            <div className="text-white text-sm mt-1">Total Requests</div>
          </div>
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-xl  p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-white-600">{requests.length}</div>
            <div className="text-white-500 text-sm mt-1">Pending</div>
          </div>
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-xl  p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-white">0</div>
            <div className="text-gray-500 text-sm mt-1">Accepted</div>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className=" rounded-xl border-gray-200 p-8 sm:p-12 text-center shadow-sm">
            <Users className="w-16 h-16 text-white mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? "No matching requests" : "No connection requests"}
            </h3>
            <p className="text-white max-w-sm mx-auto">
              {searchTerm
                ? "Try adjusting your search terms to find what you're looking for."
                : "When someone sends you a connection request, it will appear here."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4 ">
            {filteredRequests.map((request) => (
              <div
                key={request.requestId}
                className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-xl   overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* User Info */}
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                          {getInitials(request.sender?.personalInfo)}
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {request.sender?.personalInfo?.firstName && request.sender?.personalInfo?.lastName
                              ? `${request.sender.personalInfo.firstName} ${request.sender.personalInfo.lastName}`
                              : 'Unknown User'
                            }
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 mt-1 sm:mt-0">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </span>
                        </div>

                        {/* Contact Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-gray-600 text-sm mb-3 space-y-1 sm:space-y-0">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-white" />
                            <span className="text-white">{request.sender?.email || 'No email'}</span>
                          </div>
                         
                        </div>

                        {/* Request Message */}
                        {request.message && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start space-x-3">
                              <MessageCircle className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                              <p className="text-blue-800 text-sm leading-relaxed">"{request.message}"</p>
                            </div>
                          </div>
                        )}

                        {/* Timestamp - Mobile */}
                        <div className="flex items-center mt-4 lg:hidden text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(request.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Actions & Timestamp */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-0 lg:space-y-4">
                      {/* Timestamp - Desktop */}
                      <div className="hidden lg:flex items-center text-sm text-gray-500 whitespace-nowrap">
                        <Calendar className="w-6 h-6 mr-2 text-white" />
                       <div className="text-white ">
                         {formatDate(request.createdAt)}
                       </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2">
                        <button
                          onClick={() => handleAccept(request.requestId, request.sender?._id)}
                          disabled={actionLoading === request.requestId}
                          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
                        >
                          {actionLoading === request.requestId ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleReject(request.requestId, request.sender?._id)}
                          disabled={actionLoading === request.requestId}
                          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
                        >
                          {actionLoading === request.requestId ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomingRequests;
