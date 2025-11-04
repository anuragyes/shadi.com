// src/components/ReelList.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Context/Authcontext.js';
import { Heart, MessageCircle, Play, X, User } from 'lucide-react';

const ReelList = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReel, setSelectedReel] = useState(null);
  const BASE_URL = 'http://localhost:5000';

  const { currentuser } = useContext(AuthContext);

  const fetchReels = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching reels...");
      
      // Get user ID from context
      const userId = currentuser?.id || currentuser?._id;
      console.log("👤 Current user ID:", userId);

      // Fixed: Added await and correct endpoint
      const response = await axios.get(`${BASE_URL}/api/reel/AllReels`, {
        withCredentials: true,
        params: {
          userId: userId // Send user ID as query parameter if needed
        }
      });

      console.log("✅ Reels response:", response.data);
      
      if (response.data.success) {
        setReels(response.data.data || []);
      } else {
        console.error("❌ Failed to fetch reels:", response.data.message);
        setReels([]);
      }
    } catch (error) {
      console.error('❌ Error fetching reels:', error);
      console.error('Error details:', error.response?.data);
      setReels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentuser) {
      fetchReels();
    }
  }, [currentuser]);

  const handleLike = async (reelId) => {
    try {
      console.log("❤️ Liking reel:", reelId);
      
      const response = await axios.post(
        `${BASE_URL}/api/reel/${reelId}/like`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update the reel in state
        setReels(prevReels => 
          prevReels.map(reel => 
            reel._id === reelId 
              ? { 
                  ...reel, 
                  likes: response.data.data.likes,
                  isLiked: response.data.data.isLiked 
                }
              : reel
          )
        );
      }
    } catch (error) {
      console.error('❌ Error liking reel:', error);
      alert('Failed to like reel: ' + (error.response?.data?.message || error.message));
    }
  };

  const openModal = (reel) => {
    setSelectedReel(reel);
  };

  const closeModal = () => {
    setSelectedReel(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        <span className="ml-3 text-gray-600">Loading reels...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Discover Potential Matches
        </h1>
        <p className="text-xl text-gray-600">
          Watch reels from verified profiles and connect with your soulmate
        </p>
      </div>

      {reels.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
          <div className="w-24 h-24 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Play className="w-10 h-10 text-pink-500" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">
            No Reels Yet
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Be the first to share your story and connect with potential matches
          </p>
          <button 
            onClick={fetchReels}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full hover:shadow-lg transition-all duration-200"
          >
            Refresh Reels
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reels.map((reel) => (
            <div key={reel._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              {/* User Info */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  {reel.user?.profilePhoto ? (
                    <img 
                      src={reel.user.profilePhoto} 
                      alt={reel.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {reel.user?.name || 'Anonymous User'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(reel.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Media Thumbnail */}
              <div
                className="relative cursor-pointer group"
                onClick={() => openModal(reel)}
              >
                <div className="aspect-[9/16] bg-gray-200 relative overflow-hidden">
                  {reel.mediaType === 'video' ? (
                    <video
                      src={reel.mediaUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      muted
                    />
                  ) : (
                    <img
                      src={reel.mediaUrl}
                      alt={reel.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Play className="w-8 h-8 text-pink-500 fill-current" />
                    </div>
                  </div>
                  
                  {/* Media type badge */}
                  <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                    {reel.mediaType === 'video' ? 'VIDEO' : 'IMAGE'}
                  </div>
                </div>
              </div>

              {/* Actions & Info */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => handleLike(reel._id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                      reel.isLiked
                        ? 'text-pink-600 bg-pink-50'
                        : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${reel.isLiked ? 'fill-current' : ''}`} />
                    <span>{reel.likes || 0}</span>
                  </button>

                  <button className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors duration-200">
                    <MessageCircle className="w-5 h-5" />
                    <span>{reel.comments || 0}</span>
                  </button>
                </div>

                {reel.caption && (
                  <p className="text-gray-700 mb-3 line-clamp-2">
                    {reel.caption}
                  </p>
                )}

                {(reel.hashtags && reel.hashtags.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {reel.hashtags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="text-sm bg-gradient-to-r from-pink-50 to-purple-50 text-pink-600 px-3 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {reel.hashtags.length > 3 && (
                      <span className="text-sm text-gray-500 px-2 py-1">
                        +{reel.hashtags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Media Playback */}
      {selectedReel && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {selectedReel.user?.profilePhoto ? (
                  <img 
                    src={selectedReel.user.profilePhoto} 
                    alt={selectedReel.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {selectedReel.user?.name || 'Anonymous User'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedReel.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {selectedReel.mediaType === 'video' ? (
                <video
                  src={selectedReel.mediaUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[60vh] object-contain rounded-xl"
                />
              ) : (
                <img
                  src={selectedReel.mediaUrl}
                  alt={selectedReel.caption}
                  className="w-full max-h-[60vh] object-contain rounded-xl"
                />
              )}

              <div className="mt-6">
                {selectedReel.caption && (
                  <p className="text-gray-700 text-lg mb-4">
                    {selectedReel.caption}
                  </p>
                )}

                {(selectedReel.hashtags && selectedReel.hashtags.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {selectedReel.hashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex gap-6 mt-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Heart className={`w-4 h-4 ${selectedReel.isLiked ? 'fill-current text-pink-500' : ''}`} />
                    <span>{selectedReel.likes || 0} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{selectedReel.comments || 0} comments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelList;