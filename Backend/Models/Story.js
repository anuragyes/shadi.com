// models/Story.js
import mongoose from "mongoose";

const storyItemSchema = new mongoose.Schema({
  imageUrl: String,
  videoUrl: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },

  // ⏳ TTL FIELD — AUTO DELETE AFTER 24 HOURS
  expireAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    expires: 0, // MongoDB TTL index
  },
});

const storySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    stories: [storyItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Story", storySchema);
