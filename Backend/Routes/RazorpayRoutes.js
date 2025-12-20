import express from "express";
import mongoose from "mongoose"
import { RazorPayPayment } from "../Controllers/RazorPay.js";




const Razorpayrouter = express.Router();

Razorpayrouter.post("/create-order/:userId", RazorPayPayment);
export default Razorpayrouter
