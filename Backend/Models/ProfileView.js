import  mongoose from "mongoose"

const profileSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one settings document per user
    },

    // Profile visibility
    profileVisibility: {
      type: String,
      enum: ["private", "public"],
      default: "public", // safest default
    },

    // Privacy toggles
    showOnlineStatus: {
      type: Boolean,
      default: false,
    },

    showLastSeen: {
      type: Boolean,
      default: false,
    },

    showLocation: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

 export default mongoose.model("ProfileSettings", profileSettingsSchema);
