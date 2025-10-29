// models/Interest.js
const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  message: String,
  interestType: {
    type: String,
    enum: ['interest', 'shortlist'],
    default: 'interest'
  }
}, {
  timestamps: true
});

// Ensure one interest per user pair
interestSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

module.exports = mongoose.model('Interest', interestSchema);