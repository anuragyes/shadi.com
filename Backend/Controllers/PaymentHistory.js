
import crypto from "crypto";
import Payment from "../Models/Payment.js"
import express from "express";

export const History = async (req, res) => {
    try {
        const { userId } = req.params;
        //  console.log("this is userid--------------------------------------" , userId)

        const transactions = await Payment.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            transactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


//    check to find the premium or not  by the user 

export const checkpremium = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("UserId:", userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    // Get latest payment of user using sort method 
    const payment = await Payment.findOne({ userId })
      .sort({ createdAt: -1 });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "No payment record found",
        premium: "Free"
      });
    }

    // Case 1: Payment created but not completed
    if (payment.status === "created") {
      return res.status(200).json({
        success: true,
        status: payment.status,
        premium: payment.premium,
        planName: payment.planName,
        duration: payment.duration,
        features: payment.features,
        amount: payment.amount,
        expiresAt: payment.expiresAt || null
      });
    }

    // Case 2: Payment successful
    if (payment.status === "success") {
      // Check expiry
      if (payment.expiresAt && new Date() > payment.expiresAt) {
        return res.status(200).json({
          success: true,
          status: "expired",
          premium: "Free",
          message: "Premium plan expired"
        });
      }

      return res.status(200).json({
        success: true,
        status: payment.status,
        premium: payment.premium,
        planName: payment.planName,
        duration: payment.duration,
        features: payment.features,
        expiresAt: payment.expiresAt
      });
    }

    // Case 3: Payment failed
    return res.status(200).json({
      success: true,
      status: "failed",
      premium: "Free",
      message: "Payment failed"
    });

  } catch (error) {
    console.error("checkpremium error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};
