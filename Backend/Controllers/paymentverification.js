import crypto from "crypto";
import Payment from "../Models/Payment.js"
import express from "express";
import mongoose from "mongoose";







// Payment verification controller
// export const payment_verification = async (req, res) => {
//   const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

//   try {
//     console.log("Payment verification endpoint hit");

//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, amount, planId } = req.body;

//     // Debug: Log received data
//     console.log("Received data:", {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature: razorpay_signature ? "Present" : "Missing",
//       userId,
//       amount,
//       planId
//     });

//     // Validate required fields
//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !amount) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields: orderId, paymentId, signature, userId, and amount are required"
//       });
//     }

//     // Validate userId format
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user ID format"
//       });
//     }

//     // Create signature string
//     const body = razorpay_order_id + "|" + razorpay_payment_id;

//     // Generate expected signature
//     const expectedSignature = crypto
//       .createHmac("sha256", RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest("hex");

//     // Compare signatures
//     if (expectedSignature === razorpay_signature) {
//       // Signature is valid → success
//       const payment = await Payment.create({
//         orderId: razorpay_order_id,
//         paymentId: razorpay_payment_id,
//         signature: razorpay_signature,
//         amount: amount,
//         userId: userId,
//         status: "success"
//       });

//       console.log("Payment saved to DB:", payment._id);

//       // Optional: Update user plan here
//       // await User.findByIdAndUpdate(userId, { isPremium: true, plan: planId, premiumExpiry: calculateExpiry(planId) });

//       return res.json({
//         success: true,
//         message: "Payment verified and recorded successfully",
//         paymentId: payment._id
//       });
//     } else {
//       // Signature mismatch → failed payment
//       await Payment.create({
//         orderId: razorpay_order_id,
//         paymentId: razorpay_payment_id,
//         signature: razorpay_signature,
//         amount: amount,
//         userId: userId,
//         status: "failed"
//       });

//       return res.status(400).json({
//         success: false,
//         message: "Invalid payment signature"
//       });
//     }
//   } catch (error) {
//     console.error("Payment verification error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error during payment verification",
//       error: error.message
//     });
//   }
// };





export const payment_verification = async (req, res) => {
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

  try {
    console.log("Payment verification endpoint hit");

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment details"
      });
    }

    // Create signature string
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // Signature mismatch
    if (expectedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: "failed" }
      );

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    // ✅ Signature valid → update existing payment
    const payment = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: "success"
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found"
      });
    }

    console.log("Payment verified & updated:", payment._id);

    return res.json({
      success: true,
      message: "Payment verified successfully",
      paymentId: payment._id
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during payment verification",
      error: error.message
    });
  }
};
