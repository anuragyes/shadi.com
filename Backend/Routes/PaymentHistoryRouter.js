// In your backend routes
import crypto from "crypto";
import express from "express";
import mongoose from 'mongoose'
import { checkpremium, History } from "../Controllers/PaymentHistory.js";
const historypayment = express.Router();
historypayment.get('/TransactionHistory/:userId', History);
historypayment.get("/getpremium/:userId",checkpremium);
export default historypayment;

