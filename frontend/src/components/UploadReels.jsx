// src/components/ModernMediaUpload.js
import React, { useState, useRef, useContext } from 'react';
import axios from 'axios';
import toast from "react-hot-toast";
import {
  Upload,
  Video,
  Image,
  X,
  User,
  Heart,
  Sparkles,
  CheckCircle,
  Loader,
  Globe
} from 'lucide-react';
import { AuthContext } from '../Context/Authcontext.js';

const UploadReels = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const { currentuser } = useContext(AuthContext);
  const API_BASE_URL = 'https://shadii-com.onrender.com';

  const userId = currentuser?.id || currentuser?._id;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (fileList) => {
    const validFiles = fileList.filter(file =>
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    const newFiles = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      preview: URL.createObjectURL(file),
      status: 'pending',
      url: null
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };



  // Upload to your backend (which then uploads to Cloudinary)
  const uploadToBackend = async (file) => {
    const formData = new FormData();
    formData.append('media', file.file);
    formData.append('caption', caption);
    formData.append('privacy', privacy);
    formData.append('userId', userId); // Send userId to backend

    try {
      console.log("📤 Uploading file for user:", userId);
      toast.loading("Uploading media...", { id: "upload-toast" });

      const response = await axios.post(
        `${API_BASE_URL}/api/reel/upload`,
        formData,
        {
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(prev => ({
              ...prev,
              [file.id]: progress
            }));
          },
        }
      );

      console.log("✅ Upload response:", response.data);
      toast.success("✅ Media uploaded successfully!");
      return response.data;

    } catch (error) {
      console.error("❌ Upload error:", error.response?.data || error.message);
      toast.error(
        `❌ Upload failed: ${error.response?.data?.message || error.message}`,
        { id: "upload-toast" }
      );
      throw new Error(`Upload failed: ${error.response?.data?.message || error.message}`);
    } finally {
      toast.dismiss("upload-toast");
    }
  };


  const handleUpload = async () => {
    if (files.length === 0) return;

    if (!userId) {
      alert('Please login to upload files');
      return;
    }

    setUploading(true);
    const uploadedFiles = [];

    try {
      console.log("🚀 Starting upload for user:", userId);

      for (const file of files) {
        if (file.status === 'uploaded') continue;

        // Update file status to uploading
        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, status: 'uploading' } : f
        ));

        console.log(`🔄 Uploading: ${file.file.name}`);

        // Upload to backend (which handles Cloudinary)
        const backendResponse = await uploadToBackend(file);

        // Update file status to uploaded
        setFiles(prev => prev.map(f =>
          f.id === file.id ? {
            ...f,
            status: 'uploaded',
            url: backendResponse.data.mediaUrl,
            dbId: backendResponse.data._id
          } : f
        ));

        uploadedFiles.push({
          ...file,
          url: backendResponse.data.mediaUrl,
          dbId: backendResponse.data._id
        });

        console.log(`✅ Uploaded: ${file.file.name}`);
      }

      alert('🎉 All files uploaded successfully!');

      // Reset form after successful upload
      setTimeout(() => {
        setFiles([]);
        setCaption('');
        setUploadProgress({});
      }, 2000);

    } catch (error) {
      console.error('💥 Upload error:', error);
      alert(`Upload failed: ${error.message}`);

      // Mark files as failed
      setFiles(prev => prev.map(f =>
        f.status === 'uploading' ? { ...f, status: 'failed' } : f
      ));
    } finally {
      setUploading(false);
    }
  };

  const getFileStatusIcon = (file) => {
    switch (file.status) {
      case 'uploaded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'uploading':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return file.type === 'image'
          ? <Image className="w-5 h-5 text-gray-400" />
          : <Video className="w-5 h-5 text-gray-400" />;
    }
  };

  const getFileStatusText = (file) => {
    switch (file.status) {
      case 'uploaded':
        return 'Uploaded';
      case 'uploading':
        return `Uploading... ${uploadProgress[file.id] || 0}%`;
      case 'failed':
        return 'Failed';
      default:
        return 'Ready to upload';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-rose-500 to-pink-600 rounded-3xl shadow-2xl mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Share Your Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Upload photos and videos to showcase your personality and help potential matches get to know the real you
          </p>
        </div>

        {/* User Info */}
        {userId && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {currentuser?.personalInfo?.firstName || 'User'}'s Gallery
                </h3>
                <p className="text-sm text-gray-500">User ID: {userId}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Upload Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-8">
            {/* Privacy Settings */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center">
                  <User className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Your Profile Gallery</h3>
                  <p className="text-sm text-gray-500">Build your story</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                  className="bg-transparent border-0 text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer"
                >
                  <option value="public">Public</option>
                  <option value="friends">Matches Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div
              className={`relative border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 mb-8 ${dragActive
                  ? 'border-rose-400 bg-rose-50 scale-105 shadow-lg'
                  : 'border-gray-200 hover:border-rose-300 hover:bg-rose-25'
                } group cursor-pointer`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-rose-400 to-pink-500 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Upload className="w-10 h-10 text-white" />
                </div>

                <div>
                  <p className="text-2xl font-semibold text-gray-700 mb-3">
                    {files.length > 0 ? `${files.length} files selected` : 'Drop your memories here'}
                  </p>
                  <p className="text-gray-500 text-lg">
                    Upload photos and videos that showcase your personality, hobbies, and lifestyle
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 rounded-2xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <Sparkles className="w-5 h-5" />
                  Choose Files
                </div>
              </div>
            </div>

            {/* File Previews */}
            {files.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-500" />
                  Your Selections ({files.length})
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="relative group bg-gray-50 rounded-2xl overflow-hidden border-2 border-gray-200"
                    >
                      {/* Media Preview */}
                      {file.type === 'image' ? (
                        <img
                          src={file.preview}
                          alt="Preview"
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <video
                          src={file.preview}
                          className="w-full h-32 object-cover"
                          muted
                        />
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center"
                        >
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>

                      {/* Status Indicator */}
                      <div className="absolute top-2 left-2">
                        {getFileStatusIcon(file)}
                      </div>

                      {/* Status Text */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full text-center">
                          {getFileStatusText(file)}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {file.status === 'uploading' && uploadProgress[file.id] && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                          <div
                            className="h-full bg-gradient-to-r from-rose-500 to-pink-600 transition-all duration-300"
                            style={{ width: `${uploadProgress[file.id]}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Caption Input */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Add a Caption (Optional)
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Share the story behind these moments... What makes them special to you?"
                rows="3"
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 resize-none bg-gray-50/50 hover:bg-white text-lg"
              />
            </div>

            {/* Upload Button */}
            <div className="flex justify-center">
              <button
                onClick={handleUpload}
                disabled={uploading || files.length === 0 || !userId}
                className={`px-16 py-5 rounded-2xl font-bold text-lg transition-all duration-300 ${uploading || files.length === 0 || !userId
                    ? 'bg-gray-300 cursor-not-allowed transform scale-95'
                    : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 transform hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl'
                  } text-white relative overflow-hidden group`}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {uploading ? (
                    <>
                      <Loader className="w-6 h-6 animate-spin" />
                      <span>Uploading Memories...</span>
                    </>
                  ) : !userId ? (
                    <>
                      <X className="w-6 h-6" />
                      <span>Please Login to Upload</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-6 h-6" />
                      <span>Share With Potential Matches</span>
                      <Sparkles className="w-6 h-6" />
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Image className="w-8 h-8 text-rose-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">High Quality</h4>
            <p className="text-gray-600 text-sm">Crystal clear images and videos</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-pink-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Secure Storage</h4>
            <p className="text-gray-600 text-sm">Safe and private cloud storage</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Privacy Control</h4>
            <p className="text-gray-600 text-sm">Choose who sees your content</p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default UploadReels;
