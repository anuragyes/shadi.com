import crypto  from "crypto";
import  Payment   from  "../Models/Payment.js"
import express from "express";
import { payment_verification } from "../Controllers/paymentverification.js";

 const verificationRouter = express.Router();

verificationRouter.post("/verify-payment",payment_verification );
 
 export default verificationRouter;

