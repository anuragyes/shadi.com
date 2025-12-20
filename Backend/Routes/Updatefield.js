import express from "express";
import { isAuth } from '../Middleware/IsAuth.js'
import { updateprofileofUser } from "../Controllers/updatetheField.js";



const UpdateField = express.Router();

// 🟢 CHAT REQUEST SYSTEM
UpdateField.put("/profileUpdate", isAuth, updateprofileofUser);

export default UpdateField;
