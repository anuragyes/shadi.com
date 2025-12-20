import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // Razorpay order id
    orderId: {
      type: String,
      required: true
    },

    // Razorpay payment id
    paymentId: {
      type: String
    },

    // Razorpay signature
    signature: {
      type: String
    },

    // Amount in paise (VERY IMPORTANT)
    amount: {
      type: Number,
      required: true
    },

    // Linked User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // ✅ NEW FIELDS (Plan related)
    planId: {
      type: String,
      required: true
    },

    planName: {
      type: String,
      required: true
    },

    duration: {
      type: String, // example: "1 Month", "6 Months", "1 Year"
      required: true
    },

    features: {
      type: [String], // array of features
      default: []
    },

    // Premium type
    premium: {
      type: String,
      enum: ["Free", "Platinum", "Silver", "Gold"],
      default: "Free"
    },

    // Payment status
    status: {
      type: String,
      enum: ["created", "success", "failed"],
      default: "created"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
