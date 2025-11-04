import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlayIcon,
  PauseIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid
} from '@heroicons/react/24/solid';
import axios from 'axios';

const Feed = () => {
  // All state management in one component
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const videoRefs = useRef({});

  // Create axios instance with correct base URL
  const api = axios.create({
    baseURL: 'https://shadii-com.onrender.com', // Your backend URL
    timeout: 10000,
    withCredentials: true
  });

  // Fetch reels data with Axios - using your exact API endpoint
  const fetchReels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching reels from API...');

      const response = await api.get('/api/reel/AllReels'); // Your exact endpoint
      console.log('API Response:', response.data);

      if (response.data.success) {
        const reelsWithState = response.data.data.map(reel => ({
          ...reel,
          // Add missing fields with default values
          isLiked: false,
          isBookmarked: false,
          likesCount: reel.likes?.length || 0,
          commentsCount: reel.comments?.length || 0,
          isPlaying: false,
          isMuted: true,
          showControls: false,
          // Ensure user data is properly structured
          userId: {
            ...reel.userId,
            firstName: reel.userId?.firstName || 'User',
            lastName: reel.userId?.lastName || '',
            profilePhoto: reel.userId?.profilePhoto || 'https://via.placeholder.com/40x40/333333/ffffff?text=U'
          }
        }));
        setReels(reelsWithState);
        console.log('Processed reels:', reelsWithState);
      } else {
        throw new Error(response.data.message || 'Failed to fetch reels');
      }
    } catch (err) {
      console.error('Full error details:', err);

      let errorMessage = 'Failed to load reels';

      if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error: Cannot connect to server';
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Connection refused: Server may be down';
      } else if (err.response) {
        // Server responded with error status
        if (err.response.status === 404) {
          errorMessage = 'API endpoint not found. Please check the URL.';
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.response.data && typeof err.response.data === 'string' && err.response.data.includes('<!doctype')) {
          errorMessage = 'Server returned HTML instead of JSON. Check API endpoint.';
        } else {
          errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Check if server is running.';
      } else {
        errorMessage = err.message || 'Unknown error occurred';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Video control functions
  const handlePlay = useCallback(async (reelId) => {
    // Pause currently playing video
    if (currentPlaying && currentPlaying !== reelId) {
      const previousVideo = videoRefs.current[currentPlaying];
      if (previousVideo) {
        previousVideo.pause();
        previousVideo.currentTime = 0;
      }
    }

    // Play new video
    const video = videoRefs.current[reelId];
    if (video) {
      try {
        await video.play();
        setCurrentPlaying(reelId);
        setReels(prev => prev.map(reel =>
          reel._id === reelId ? { ...reel, isPlaying: true } : reel
        ));
      } catch (err) {
        console.error('Error playing video:', err);
      }
    }
  }, [currentPlaying]);

  const handlePause = useCallback((reelId) => {
    const video = videoRefs.current[reelId];
    if (video) {
      video.pause();
      if (currentPlaying === reelId) {
        setCurrentPlaying(null);
      }
      setReels(prev => prev.map(reel =>
        reel._id === reelId ? { ...reel, isPlaying: false } : reel
      ));
    }
  }, [currentPlaying]);

  const handleVideoClick = useCallback((reelId) => {
    const reel = reels.find(r => r._id === reelId);
    if (reel?.mediaType === 'video') {
      if (reel.isPlaying) {
        handlePause(reelId);
      } else {
        handlePlay(reelId);
      }
    }
  }, [reels, handlePlay, handlePause]);

  const toggleMute = useCallback((reelId, e) => {
    e?.stopPropagation();
    const video = videoRefs.current[reelId];
    if (video) {
      video.muted = !video.muted;
      setReels(prev => prev.map(reel =>
        reel._id === reelId ? { ...reel, isMuted: !reel.isMuted } : reel
      ));
    }
  }, []);

  // Like/Bookmark functions with Axios
  const handleLike = useCallback(async (reelId) => {
    const reel = reels.find(r => r._id === reelId);
    if (!reel) return;

    // Store original state for rollback
    const originalLikedState = reel.isLiked;
    const originalLikesCount = reel.likesCount;

    // Optimistic update
    setReels(prev => prev.map(reel =>
      reel._id === reelId
        ? {
          ...reel,
          isLiked: !reel.isLiked,
          likesCount: reel.isLiked ? reel.likesCount - 1 : reel.likesCount + 1
        }
        : reel
    ));

    try {
      await api.post(`/api/reel/${reelId}/like`);
    } catch (err) {
      // Revert on error
      setReels(prev => prev.map(reel =>
        reel._id === reelId
          ? {
            ...reel,
            isLiked: originalLikedState,
            likesCount: originalLikesCount
          }
          : reel
      ));
      console.error('Like error:', err);
    }
  }, [reels]);

  const handleBookmark = useCallback(async (reelId) => {
    const reel = reels.find(r => r._id === reelId);
    if (!reel) return;

    // Store original state for rollback
    const originalBookmarkedState = reel.isBookmarked;

    // Optimistic update
    setReels(prev => prev.map(reel =>
      reel._id === reelId
        ? { ...reel, isBookmarked: !reel.isBookmarked }
        : reel
    ));

    try {
      await api.post(`/api/reel/${reelId}/bookmark`);
    } catch (err) {
      // Revert on error
      setReels(prev => prev.map(reel =>
        reel._id === reelId
          ? { ...reel, isBookmarked: originalBookmarkedState }
          : reel
      ));
      console.error('Bookmark error:', err);
    }
  }, [reels]);

  const handleShare = useCallback(async (reelId) => {
    try {
      const shareUrl = `${window.location.origin}/reel/${reelId}`;
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Share error:', err);
      alert('Failed to share reel');
    }
  }, []);

  const handleMouseEnter = useCallback((reelId) => {
    setReels(prev => prev.map(reel =>
      reel._id === reelId ? { ...reel, showControls: true } : reel
    ));
  }, []);

  const handleMouseLeave = useCallback((reelId) => {
    setReels(prev => prev.map(reel =>
      reel._id === reelId ? { ...reel, showControls: false } : reel
    ));
  }, []);

  // Utility functions
  const formatCount = useCallback((count) => {
    if (!count && count !== 0) return '0';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  }, []);

  const getTimeAgo = useCallback((timestamp) => {
    if (!timestamp) return 'Recently';

    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = (now - time) / (1000 * 60 * 60);

    if (diffInHours < 1) return `${Math.floor(diffInHours * 60)}m ago`;
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  }, []);

  // Set up video refs
  const setVideoRef = useCallback((el, reelId) => {
    if (el) {
      videoRefs.current[reelId] = el;
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-white text-lg">Loading reels...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-red-500 mb-4 text-4xl">⚠️</div>
          <p className="text-red-400 mb-4 text-lg font-semibold">API Error</p>
          <p className="text-gray-300 mb-4 text-sm">{error}</p>
          <div className="text-gray-400 text-xs mb-6">
            <p>Make sure:</p>
            <p>• Backend server is running on port 5000</p>
            <p>• API endpoint is correct: /api/reel/AllReels</p>
            <p>• CORS is enabled on backend</p>
          </div>
          <button
            onClick={fetchReels}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && reels.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-gray-400 mb-4 text-6xl">📱</div>
          <p className="text-gray-300 mb-2 text-xl font-semibold">No reels yet</p>
          <p className="text-gray-400 mb-6">Be the first one to create a reel!</p>
          <button
            onClick={fetchReels}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto bg-black">
        {reels.map((reel) => (
          <div
            key={reel._id}
            className="relative h-screen bg-black border-b border-gray-800 snap-start"
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/70 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={reel.userId.profilePhoto}
                      alt={`${reel.userId.firstName} ${reel.userId.lastName}`}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/40x40/333333/ffffff?text=U';
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-semibold text-sm text-white">
                      {reel.userId.firstName} {reel.userId.lastName}
                    </p>
                    {reel.location && (
                      <p className="text-xs text-gray-300">{reel.location}</p>
                    )}
                  </div>
                </div>
                <button className="text-white p-1 hover:bg-white/10 rounded-full transition-colors">
                  <EllipsisHorizontalIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Media Content */}
            <div
              className="relative w-full h-full flex items-center justify-center bg-black"
              onMouseEnter={() => handleMouseEnter(reel._id)}
              onMouseLeave={() => handleMouseLeave(reel._id)}
              onClick={() => handleVideoClick(reel._id)}
            >
              {reel.mediaType === 'video' ? (
                <>
                  <video
                    ref={(el) => setVideoRef(el, reel._id)}
                    src={reel.mediaUrl}
                    className="w-full h-full object-cover"
                    loop
                    muted={reel.isMuted}
                    playsInline
                    preload="metadata"
                  />

                  {/* Video Controls Overlay */}
                  {reel.showControls && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300">
                      <button
                        className="p-6 rounded-full bg-black/50 backdrop-blur-sm transform hover:scale-105 transition-transform"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {reel.isPlaying ? (
                          <PauseIcon className="w-16 h-16 text-white" />
                        ) : (
                          <PlayIcon className="w-16 h-16 text-white" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Mute Button */}
                  <button
                    onClick={(e) => toggleMute(reel._id, e)}
                    className="absolute bottom-24 right-4 z-10 p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
                  >
                    {reel.isMuted ? (
                      <SpeakerXMarkIcon className="w-6 h-6 text-white" />
                    ) : (
                      <SpeakerWaveIcon className="w-6 h-6 text-white" />
                    )}
                  </button>
                </>
              ) : (
                <img
                  src={reel.mediaUrl}
                  alt={reel.caption || 'Post'}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x600/333333/ffffff?text=Image+Not+Found';
                  }}
                />
              )}
            </div>

            {/* Action Buttons Sidebar */}
            <div className="absolute right-4 bottom-32 space-y-6 z-10">
              <button
                onClick={() => handleLike(reel._id)}
                className="flex flex-col items-center space-y-1 group"
              >
                <div className="p-2 rounded-full group-hover:bg-white/10 transition-colors">
                  {reel.isLiked ? (
                    <HeartIconSolid className="w-8 h-8 text-red-500 transform scale-110 transition-transform" />
                  ) : (
                    <HeartIcon className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                  )}
                </div>
                <span className="text-xs font-semibold text-white">
                  {formatCount(reel.likesCount)}
                </span>
              </button>

              <button className="flex flex-col items-center space-y-1 group">
                <div className="p-2 rounded-full group-hover:bg-white/10 transition-colors">
                  <ChatBubbleLeftIcon className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-semibold text-white">
                  {formatCount(reel.commentsCount)}
                </span>
              </button>

              <button
                onClick={() => handleShare(reel._id)}
                className="flex flex-col items-center space-y-1 group"
              >
                <div className="p-2 rounded-full group-hover:bg-white/10 transition-colors">
                  <PaperAirplaneIcon className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-semibold text-white">Share</span>
              </button>

              <button
                onClick={() => handleBookmark(reel._id)}
                className="flex flex-col items-center space-y-1 group"
              >
                <div className="p-2 rounded-full group-hover:bg-white/10 transition-colors">
                  {reel.isBookmarked ? (
                    <BookmarkIconSolid className="w-8 h-8 text-white transform scale-110 transition-transform" />
                  ) : (
                    <BookmarkIcon className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                  )}
                </div>
              </button>
            </div>

            {/* Caption and Details */}
            <div className="absolute bottom-4 left-4 right-20 z-10">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <p className="text-white text-sm font-semibold">
                    {reel.userId.firstName} {reel.userId.lastName}
                  </p>
                  <span className="text-gray-300">•</span>
                  <p className="text-gray-300 text-xs">
                    {getTimeAgo(reel.createdAt)}
                  </p>
                </div>

                {reel.caption && (
                  <p className="text-white text-sm line-clamp-2 leading-relaxed">
                    {reel.caption}
                  </p>
                )}
              </div>
            </div>

            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default Feed;
