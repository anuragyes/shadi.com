// src/components/MyGallery.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Context/Authcontext.js';
import {
  Grid,
  List,
  Play,
  Image,
  Video,
  Heart,
  MessageCircle,
  Eye,
  Calendar,
  Filter,
  Download,
  Share2,
  MoreVertical,
  User,
  Camera,
  Film,
  BarChart3,
  Clock,
  Trash2,
  Edit3,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Gallery = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    images: 0,
    videos: 0,
    totalLikes: 0,
    totalViews: 0
  });
  const BASE_URL = 'https://shadii-com.onrender.com';

  const { currentuser } = useContext(AuthContext);

  const fetchMyMedia = async () => {
    try {
      setLoading(true);
      const userId = currentuser?.id || currentuser?._id;

      console.log("📸 Fetching my media for user:", userId);

      const response = await axios.get(
        `${BASE_URL}/api/reel/my-reels/${userId}`,
        { withCredentials: true }
      );

      console.log("✅ My media response:", response.data);

      if (response.data.success) {
        const mediaData = response.data.data || [];
        setMedia(mediaData);

        // Calculate stats
        const images = mediaData.filter(item => item.mediaType === 'image').length;
        const videos = mediaData.filter(item => item.mediaType === 'video').length;
        const totalLikes = mediaData.reduce((sum, item) => sum + (item.likes || 0), 0);
        const totalViews = mediaData.reduce((sum, item) => sum + (item.views || 0), 0);

        setStats({
          total: mediaData.length,
          images,
          videos,
          totalLikes,
          totalViews
        });
      }
    } catch (error) {
      console.error('❌ Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentuser) {
      fetchMyMedia();
    }
  }, [currentuser]);

const deleteMedia = async (mediaId) => {
  try {
    const userId = currentuser?.id || currentuser?._id;
    setDeleting(true);

    console.log("🗑️ Deleting media:", mediaId);

    const response = await axios.delete(`${BASE_URL}/api/reel/deleteReel`, {
      data: {
        reel_id: mediaId,
        user_id: userId
      },
      withCredentials: true
    });

    if (response.data.success) {
      console.log("✅ Media deleted successfully");
      toast.success("✅ Media deleted successfully");

      // Remove deleted item from local state
      setMedia(prev => prev.filter(item => item._id !== mediaId));

      // Update stats
      const deletedMedia = media.find(item => item._id === mediaId);
      if (deletedMedia) {
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          images: deletedMedia.mediaType === 'image' ? prev.images - 1 : prev.images,
          videos: deletedMedia.mediaType === 'video' ? prev.videos - 1 : prev.videos,
          totalLikes: prev.totalLikes - (deletedMedia.likes || 0),
          totalViews: prev.totalViews - (deletedMedia.views || 0)
        }));
      }

      // Close modal
      setDeleteConfirm(null);

      // Optional success alert
      alert('🎉 Media deleted successfully!');
    }
  } catch (error) {
    console.error("❌ Error deleting media:", error);
    toast.error(error.response?.data?.message || error.message || "Failed to delete media");
  } finally {
    setDeleting(false);
  }
};

  const confirmDelete = (mediaItem) => {
    setDeleteConfirm(mediaItem);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const filteredMedia = media.filter(item => {
    if (filter === 'images') return item.mediaType === 'image';
    if (filter === 'videos') return item.mediaType === 'video';
    return true;
  });

  const openMediaViewer = (mediaItem) => {
    setSelectedMedia(mediaItem);
  };

  const closeMediaViewer = () => {
    setSelectedMedia(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* User Info */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Camera className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white rounded-full w-8 h-8 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  My Gallery
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {currentuser?.personalInfo?.firstName || 'User'}'s creative space
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-pink-50 rounded-2xl">
                <div className="text-2xl font-bold text-pink-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Posts</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-2xl">
                <div className="text-2xl font-bold text-blue-600">{stats.images}</div>
                <div className="text-sm text-gray-600">Images</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-2xl">
                <div className="text-2xl font-bold text-purple-600">{stats.videos}</div>
                <div className="text-sm text-gray-600">Videos</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-2xl">
                <div className="text-2xl font-bold text-green-600">{stats.totalLikes}</div>
                <div className="text-sm text-gray-600">Total Likes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all duration-200 ${viewMode === 'grid'
                      ? 'bg-white shadow-md text-pink-600'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all duration-200 ${viewMode === 'list'
                      ? 'bg-white shadow-md text-pink-600'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-transparent border-0 text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer"
                >
                  <option value="all">All Media</option>
                  <option value="images">Images Only</option>
                  <option value="videos">Videos Only</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Showing {filteredMedia.length} of {media.length} items
            </div>
          </div>
        </div>

        {/* Media Grid/List */}
        {filteredMedia.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <div className="w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Camera className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              No Media Yet
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Start building your gallery by uploading photos and videos to showcase your personality.
            </p>
            <button
              onClick={fetchMyMedia}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-2xl hover:shadow-lg transition-all duration-200 font-semibold"
            >
              Refresh Gallery
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedia.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer relative"
              >
                {/* Delete Button - Top Right */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(item);
                  }}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                  title="Delete this post"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>

                {/* Media Thumbnail */}
                <div
                  className="relative aspect-square bg-gray-100 overflow-hidden"
                  onClick={() => openMediaViewer(item)}
                >
                  {item.mediaType === 'video' ? (
                    <video
                      src={item.mediaUrl}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      muted
                    />
                  ) : (
                    <img
                      src={item.mediaUrl}
                      alt={item.caption}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    {item.mediaType === 'video' && (
                      <div className="w-16 h-16 bg-white bg-opacity-90 rounded-2xl flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-6 h-6 text-pink-500 fill-current ml-1" />
                      </div>
                    )}
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    {item.mediaType === 'video' ? <Film className="w-3 h-3" /> : <Image className="w-3 h-3" />}
                    {item.mediaType === 'video' ? 'VIDEO' : 'IMAGE'}
                  </div>

                  {/* Quick Stats */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between text-white text-sm">
                    <div className="flex items-center gap-1 bg-black bg-opacity-60 px-2 py-1 rounded-full">
                      <Heart className="w-3 h-3" />
                      <span>{item.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-black bg-opacity-60 px-2 py-1 rounded-full">
                      <Eye className="w-3 h-3" />
                      <span>{item.views || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  {item.caption && (
                    <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      {formatFileSize(item.size)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {filteredMedia.map((item, index) => (
              <div
                key={item._id}
                className={`group flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${index < filteredMedia.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
              >
                {/* Thumbnail */}
                <div
                  className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0"
                  onClick={() => openMediaViewer(item)}
                >
                  {item.mediaType === 'video' ? (
                    <video
                      src={item.mediaUrl}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={item.mediaUrl}
                      alt={item.caption}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {item.mediaType === 'video' && (
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div
                  className="flex-1 min-w-0"
                  onClick={() => openMediaViewer(item)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.mediaType === 'video'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-green-100 text-green-600'
                      }`}>
                      {item.mediaType === 'video' ? 'VIDEO' : 'IMAGE'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(item.size)}
                    </span>
                  </div>

                  {item.caption ? (
                    <p className="text-gray-800 font-medium truncate">
                      {item.caption}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">No caption</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {item.likes || 0} likes
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {item.views || 0} views
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => confirmDelete(item)}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors duration-200"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200">
                    <Share2 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Media Viewer Modal */}
        {selectedMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    {selectedMedia.mediaType === 'video' ?
                      <Film className="w-5 h-5 text-white" /> :
                      <Image className="w-5 h-5 text-white" />
                    }
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {selectedMedia.mediaType === 'video' ? 'Video' : 'Image'} Details
                    </h3>
                    <p className="text-sm text-gray-500">
                      Uploaded {formatDate(selectedMedia.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeMediaViewer}
                  className="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Media Display */}
                  <div className="flex items-center justify-center">
                    {selectedMedia.mediaType === 'video' ? (
                      <video
                        src={selectedMedia.mediaUrl}
                        controls
                        autoPlay
                        className="w-full max-h-[400px] rounded-2xl object-contain"
                      />
                    ) : (
                      <img
                        src={selectedMedia.mediaUrl}
                        alt={selectedMedia.caption}
                        className="w-full max-h-[400px] rounded-2xl object-contain"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">CAPTION</h4>
                      <p className="text-gray-800 text-lg">
                        {selectedMedia.caption || 'No caption provided'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="text-2xl font-bold text-pink-600">{selectedMedia.likes || 0}</div>
                        <div className="text-sm text-gray-600">Likes</div>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="text-2xl font-bold text-blue-600">{selectedMedia.views || 0}</div>
                        <div className="text-sm text-gray-600">Views</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Type:</span>
                        <span className="font-medium capitalize">{selectedMedia.mediaType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Size:</span>
                        <span className="font-medium">{formatFileSize(selectedMedia.size)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Uploaded:</span>
                        <span className="font-medium">{formatDate(selectedMedia.createdAt)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Privacy:</span>
                        <span className="font-medium capitalize">{selectedMedia.privacy}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <button className="flex-1 bg-pink-500 text-white py-3 rounded-2xl hover:bg-pink-600 transition-colors duration-200 font-semibold flex items-center justify-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl hover:bg-gray-200 transition-colors duration-200 font-semibold flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => confirmDelete(selectedMedia)}
                        className="px-6 bg-red-500 text-white py-3 rounded-2xl hover:bg-red-600 transition-colors duration-200 font-semibold flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Delete Post?
                </h3>

                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this {deleteConfirm.mediaType}?
                  This action cannot be undone and the media will be permanently removed.
                </p>

                {deleteConfirm.caption && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-700 italic">
                      "{deleteConfirm.caption}"
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={cancelDelete}
                    disabled={deleting}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl hover:bg-gray-200 transition-colors duration-200 font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteMedia(deleteConfirm._id)}
                    disabled={deleting}
                    className="flex-1 bg-red-500 text-white py-3 rounded-2xl hover:bg-red-600 transition-colors duration-200 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default Gallery;
