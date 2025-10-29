// models/ProfileView.js
const mongoose = require('mongoose');

const profileViewSchema = new mongoose.Schema({
  viewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewCount: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Index for tracking unique views
profileViewSchema.index({ viewer: 1, viewedUser: 1 }, { unique: true });
profileViewSchema.index({ viewedUser: 1, createdAt: -1 });

module.exports = mongoose.model('ProfileView', profileViewSchema);