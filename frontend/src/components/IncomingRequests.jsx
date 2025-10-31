

import { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  MoreHorizontal,
  User,
  Mail,
  Calendar,
  Search,
  Filter,
  Check,
  X,
  MapPin
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from '../Context/Authcontext.js';

const IncomingRequests = () => {
  const BASE_URL = "https://shadii-com.onrender.com";
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const { currentuser } = useContext(AuthContext);

  console.log("Current user:", currentuser?.id || currentuser?._id);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const userId = currentuser?.id || currentuser?._id;
        
        if (!userId) {
          console.error("No user ID found");
          setLoading(false);
          return;
        }

        console.log("Fetching requests for user:", userId);
        
        const res = await axios.get(
          `${BASE_URL}/api/user/request/incoming/${userId}`, 
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        console.log("API Response:", res);
        console.log("Response data:", res.data);

        if (res.data && res.data.success) {
          setRequests(res.data.data || []);
        } else {
          console.error("API returned success: false", res.data?.message);
          toast.error(res.data?.message || "Failed to load requests");
          setRequests([]);
        }
      } catch (err) {
        console.error("Error fetching requests:", err);
        if (err.response) {
          console.error("Response error:", err.response.data);
          console.error("Status code:", err.response.status);
          toast.error(err.response.data?.message || "Failed to load requests");
        } else if (err.request) {
          console.error("No response received:", err.request);
          toast.error("No response from server");
        } else {
          console.error("Request setup error:", err.message);
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

  const handleAccept = async (requestId) => {
    try {
      console.log("Accepting request:", requestId);
      
      const res = await axios.post(
        `${BASE_URL}/api/user/request/${requestId}/accept`,
        {},
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log("Accept response:", res.data);

      if (res.data && res.data.success) {
        toast.success("Request accepted!");
        setRequests(prev => prev.filter(req => req._id !== requestId));
      } else {
        toast.error(res.data?.message || "Failed to accept request");
      }
    } catch (err) {
      console.error("Error accepting request:", err);
      if (err.response) {
        console.error("Response error:", err.response.data);
        toast.error(err.response.data?.message || "Failed to accept request");
      } else {
        toast.error("Network error");
      }
    }
  };

  const handleReject = async (requestId) => {
    try {
      console.log("Rejecting request:", requestId);
      
      const res = await axios.post(
        `${BASE_URL}/api/user/request/${requestId}/reject`,
        {},
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log("Reject response:", res.data);

      if (res.data && res.data.success) {
        toast.success("Request rejected!");
        setRequests(prev => prev.filter(req => req._id !== requestId));
      } else {
        toast.error(res.data?.message || "Failed to reject request");
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
      if (err.response) {
        console.error("Response error:", err.response.data);
        toast.error(err.response.data?.message || "Failed to reject request");
      } else {
        toast.error("Network error");
      }
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const filteredRequests = requests.filter(req => {
    const firstName = req.sender?.personalInfo?.firstName?.toLowerCase() || '';
    const lastName = req.sender?.personalInfo?.lastName?.toLowerCase() || '';
    const email = req.sender?.email?.toLowerCase() || '';
    const query = searchTerm.toLowerCase();
    
    return firstName.includes(query) || 
           lastName.includes(query) || 
           email.includes(query);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900">Loading requests</h3>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Connection Requests</h1>
                  <p className="text-gray-500 text-sm">
                    {requests.length} request{requests.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="hidden sm:flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{requests.length}</div>
            <div className="text-gray-500 text-sm">Total Requests</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{requests.length}</div>
            <div className="text-gray-500 text-sm">Pending</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">0</div>
            <div className="text-gray-500 text-sm">Accepted</div>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {requests.length === 0 ? "No connection requests" : "No matching requests"}
            </h3>
            <p className="text-gray-500">
              {requests.length === 0
                ? "When someone sends you a connection request, it will appear here."
                : "Try adjusting your search terms."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div key={req._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* User Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials(req.sender?.personalInfo?.firstName, req.sender?.personalInfo?.lastName)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {req.sender?.personalInfo?.firstName || 'Unknown'} {req.sender?.personalInfo?.lastName || 'User'}
                          </h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-gray-500 text-sm mb-3">
                          <div className="flex items-center space-x-1 mb-1 sm:mb-0">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{req.sender?.email || 'No email'}</span>
                          </div>
                          {req.sender?.location?.city && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{req.sender.location.city}</span>
                            </div>
                          )}
                        </div>

                        {/* Interests */}
                        {req.sender?.lifestyleInfo?.interests?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {req.sender.lifestyleInfo.interests.slice(0, 4).map((interest, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {interest}
                              </span>
                            ))}
                            {req.sender.lifestyleInfo.interests.length > 4 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                +{req.sender.lifestyleInfo.interests.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Request Message */}
                        {req.message && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start space-x-2">
                              <MessageCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <p className="text-blue-800 text-sm leading-relaxed">"{req.message}"</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
                      <button
                        onClick={() => handleAccept(req._id)}
                        className="inline-flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleReject(req._id)}
                        className="inline-flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <X className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      Received {new Date(req.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(req.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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
