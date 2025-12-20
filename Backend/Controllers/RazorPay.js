import express from 'express'
import mongoose from "mongoose";
import razorpay from "../config/razorpay.js"
import Payment from '../Models/Payment.js';



// export const RazorPayPayment = async (req, res) => {
//   try {
//     const { amount } = req.body;
//     let { userId } = req.params;

//     // 🧹 sanitize userId (fix extra quotes issue)
//     userId = userId.replace(/"/g, "").trim();

//     // validations
//     if (!amount) {
//       return res.status(400).json({
//         success: false,
//         message: "Amount is required"
//       });
//     }

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId"
//       });
//     }

//     //  Create Razorpay Order
//     const order = await razorpay.orders.create({
//       amount: amount , // rupees → paise
//       currency: "INR",
//       receipt: `order_rcptid_${Date.now()}`
//     });

//     // ✅ Save order in DB with userId
//     await Payment.create({
//       orderId: order.id,
//       amount,
//       userId,
//       status: "created"
//     });

//     res.status(200).json({
//       success: true,
//       order
//     });

//   } catch (error) {
//     console.error("Razorpay Error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


// export const RazorPayPayment = async (req, res) => {
//   try {
//     const {
//       amount,
//       planId,
//       planName,
//       duration,
//       features
//     } = req.body;

//     let { userId } = req.params;

//     // 🧹 sanitize userId
//     userId = userId.replace(/"/g, "").trim();

//     // validations
//     if (!amount || !planId || !planName || !duration) {
//       return res.status(400).json({
//         success: false,
//         message: "Amount, planId, planName and duration are required"
//       });
//     }

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId"
//       });
//     }

//     // Create Razorpay Order (amount already in paise)
//     const order = await razorpay.orders.create({
//      amount :  amount/100,
//       currency: "INR",
//       receipt: `order_rcptid_${Date.now()}`
//     });

//          console.log("Amount received (NIR):", amount);

//     // ✅ Save order in DB WITH PLAN DETAILS
//     await Payment.create({
//       orderId: order.id,
//      amount : amount/100,
//       userId,
//       planId,
//       planName,
//       duration,
//       features,
//       premium: planName, // optional but useful
//       status: "created"
//     });



//     console.log("Amount received (paise):", amount);


//     res.status(200).json({
//       success: true,
//       order
//     });

//   } catch (error) {
//     console.error("Razorpay Error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };




export const RazorPayPayment = async (req, res) => {
  try {
    const {
      amount,      // already in paise
      planId,
      planName,
      duration,
      features
    } = req.body;

    let { userId } = req.params;

    userId = userId.replace(/"/g, "").trim();

    if (!amount || !planId || !planName || !duration) {
      return res.status(400).json({
        success: false,
        message: "Amount, planId, planName and duration are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId"
      });
    }

    console.log("✅ Amount received (paise):", amount);

    // ✅ CREATE ORDER (PAISE ONLY)
    const order = await razorpay.orders.create({
      amount: amount,   // ✅ NO /100
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`
    });

    // ✅ SAVE SAME AMOUNT IN DB
    await Payment.create({
      orderId: order.id,
      amount: amount,   // ✅ NO /100
      userId,
      planId,
      planName,
      duration,
      features,
      premium: planName,
      status: "created"
    });

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
