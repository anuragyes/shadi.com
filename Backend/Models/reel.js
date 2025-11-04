// backend/Models/Reel.js
import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mediaUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  hashtags: [{
    type: String
  }],
  privacy: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },

  gallery: [{
    url: String,
    type: String,
    publicId: String,
    caption: String,
    privacy: String,
    uploadedAt: Date
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  size: {
    type: Number // File size in bytes
  },
  duration: {
    type: Number // Video duration in seconds
  },
  dimensions: {
    width: Number,
    height: Number
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better performance
reelSchema.index({ userId: 1, createdAt: -1 });
reelSchema.index({ privacy: 1, createdAt: -1 });
reelSchema.index({ hashtags: 1 });

const Reel = mongoose.model('Reel', reelSchema);

export default Reel;