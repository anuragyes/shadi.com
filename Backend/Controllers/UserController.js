
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../Models/UserModel.js";
import cloudinary from "../config/Cloudinary.js"
// import fs from "fs"; // Missing import.
import fs from 'fs/promises';




// ===================== Token Utility =====================

export const genToken = (userId, email, expiresIn = "10d") => {
  try {
    const secret = process.env.JWT_SECRET || "fallback_secret";
    return jwt.sign({ userId, email }, secret, {
      expiresIn,
    });
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Token generation failed");
  }
};

export const getUserById = async (req, res) => {
  try {
    let { id } = req.params;

    // 🧠 Handle "/me" endpoint
    if (id === "me") {
      // req.user must come from your auth middleware
      id = req.user?._id;
    }

    // 🧩 Validate the ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const user = await User.findById(id).select("-password -__v");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error("Get User by ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const updateUserProfile = async (req, res) => {
  try {
    // console.log("req.body" , req.body)

    const userId = req.body._id;    // this is the id given my mongodb
    console.log("UserID:", userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user ID found."
      });
    }

    let updates = req.body;

    if (typeof updates === 'string') {
      try {
        updates = JSON.parse(updates);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON in request body."
        });
      }
    }

    if (updates.id || updates._id) {
      delete updates.id;
      delete updates._id;
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided for update."
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // FIXED UPDATE FUNCTION - Handles the education array issue
    const safeUpdate = (target, source) => {
      for (const key in source) {
        if (!source.hasOwnProperty(key) ||
          ['password', 'role', 'isVerified', 'isActive', 'subscription'].includes(key)) {
          continue;
        }

        // SPECIAL HANDLING for partnerPreferences.education to fix array issue
        if (key === 'partnerPreferences' && source.partnerPreferences) {
          if (!target.partnerPreferences) target.partnerPreferences = {};

          for (const prefKey in source.partnerPreferences) {
            if (prefKey === 'education') {
              // If education is currently an array, convert it to object
              if (Array.isArray(target.partnerPreferences.education)) {
                target.partnerPreferences.education = {
                  level: [],
                  specific: []
                };
              }
              // Now safely update the education object
              if (!target.partnerPreferences.education) {
                target.partnerPreferences.education = {};
              }
              Object.assign(target.partnerPreferences.education, source.partnerPreferences.education);
            } else {
              target.partnerPreferences[prefKey] = source.partnerPreferences[prefKey];
            }
          }
          continue;
        }

        // Handle other nested objects
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key] || typeof target[key] !== 'object') {
            target[key] = {};
          }
          safeUpdate(target[key], source[key]);
        }
        // Handle direct field updates
        else if (source[key] !== undefined && source[key] !== null) {
          target[key] = source[key];
        }
      }
    };

    // Apply updates safely
    safeUpdate(user, updates);

    // Update timestamps
    user.lastActive = new Date();
    user.updatedAt = new Date();

    // Save without validation
    await user.save({ validateBeforeSave: false });

    // Get updated user
    const updatedUser = await User.findById(userId).select('-password -__v').lean();

    res.status(200).json({
      success: true,
      message: `Profile updated successfully.`,
      data: {
        user: updatedUser
      },
    });

  } catch (error) {
    console.error("Update Profile Error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format."
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists."
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during profile update.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



export const Login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Trim input to avoid accidental spaces
    email = email?.trim().toLowerCase();
    password = password?.trim();

    // console.log("🔍 LOGIN ATTEMPT:", { email, password: password ? "***" : "missing" });

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Find user (Assuming 'User' model is imported correctly)
    const user = await User.findOne({ email });

    if (!user) {
      // console.log("❌ User not found:", email);
      // Security best practice: use generic error message
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    // console.log("🔍 Password comparison:", isMatch);

    if (!isMatch) {
      // console.log("❌ Incorrect password for:", email);
      // Security best practice: use generic error message
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // ✅ FIX: Update isActive to true in database
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { 
        isActive: true,
        lastLogin: new Date() // Optional: also update last login time
      },
      { new: true } // Return the updated document
    );

    console.log(`✅ User ${user._id} isActive set to: ${updatedUser.isActive}`);

    // Generate JWT token using the utility function
    const token = genToken(user._id, user.email, "10d");

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // Set to 'None' for cross-site requests (e.g., front-end on different port), requires 'secure: true'
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Changed 'Strict' to 'Lax' as a common alternative
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });

    // Build response data
    const userData = {
      id: user._id,
      name: `${user.personalInfo?.firstName || ""} ${user.personalInfo?.lastName || ""}`.trim(),
      email: user.email,
      isActive: updatedUser.isActive, // ✅ Use the updated value from database
      gender: user.personalInfo?.gender || "unknown",
      subscription: user.subscription?.plan || "free",
    };

    console.log("✅ LOGIN SUCCESS:", userData.email, "isActive:", userData.isActive);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: userData,
      token, // Generally, sending the token in the body is redundant if using cookies, but useful for client-side storage.
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error during login" });
  }
};

// ======================================
// 🧾 SIGNUP CONTROLLER
// ======================================
export const UserSignup = async (req, res) => {
  try {
    let {
      email,
      password,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      religion,
      motherTongue,
      country,
      city,
      state,
      phone,
    } = req.body;

    // Trim and normalize input
    email = email?.trim().toLowerCase();
    password = password?.trim();
    firstName = firstName?.trim();
    lastName = lastName?.trim();

    console.log("📝 SIGNUP ATTEMPT for:", email);

    // Basic validation
    if (!email || !password || !firstName || !lastName || !gender || !dateOfBirth || !religion || !motherTongue || !country || !city) {
      return res.status(400).json({ success: false, message: "Please fill all required fields: email, password, first/last name, gender, DOB, religion, mother tongue, country, city." });
    }

    // Check for existing user
    // (Assuming 'User' model is imported correctly)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists with this email" });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    // Calculate age and enforce minimum age
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 18) return res.status(400).json({ success: false, message: "You must be at least 18 years old to register" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔍 Password hashed successfully.");

    // Create user data object
    const userData = {
      email,
      password: hashedPassword,
      phone,
      personalInfo: {
        firstName,
        lastName,
        gender: gender.toLowerCase(),
        dateOfBirth: birthDate,
        maritalStatus: "never_married",
        height: { value: 170, unit: "cm" },
        physicalStatus: "normal",
      },
      religiousInfo: {
        religion: religion.toLowerCase(),
        motherTongue: motherTongue.toLowerCase(),
      },
      location: {
        country: country.trim(),
        city: city.trim(),
        state: state ? state.trim() : "",
      },
      subscription: { plan: "free" },
      // Initialize profile completion fields (optional, depending on Mongoose schema)
      profileCompletion: 20, // Initial completion estimate
      isProfileComplete: false,
    };

    const user = new User(userData);
    await user.save();

    // Generate JWT using the utility function
    const token = genToken(user._id, user.email, "30d");

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Consistent SameSite policy
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    console.log("✅ User registered successfully:", user.email);

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      data: {
        id: user._id,
        email: user.email,
        name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`,
        age,
        token,
      },
    });
  } catch (error) {
    console.error("❌ SIGNUP ERROR:", error);
    // Provide better error context if it's a validation error from Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: "Validation failed during signup.", errors: messages });
    }
    res.status(500).json({ success: false, message: "Internal server error during signup" });
  }
};
// ===================== Update User Profile =====================


// ===================== Get User =====================
export const GetUser = async (req, res) => {
  try {
    const userId = req.user?.userId;
    // console.log(req.body)
    // clg

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findById(userId).select("-password -__v");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error("Get User Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ===================== User Logout =====================



export const UserLogout = async (req, res) => {
  try {
    const token = req.cookies.token;

    console.log("🍪 Token from cookies:", token ? "Present" : "Missing");

    if (!token) {
      console.log("❌ No token found in cookies");
      return res.status(400).json({ success: false, message: "No token found" });
    }

    // Decode token to get user ID with better error handling
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🔓 Decoded token:", decoded);
    } catch (jwtError) {
      console.error("❌ JWT verification failed:", jwtError.message);
      // Clear invalid token anyway
      res.clearCookie("token");
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }

    // Check if decoded token has the expected structure
    if (!decoded) {
      console.log("❌ Token decoded to null/undefined");
      res.clearCookie("token");
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token structure" 
      });
    }

    // Get user ID - try different possible properties
    const userId = decoded.id || decoded._id || decoded.userId || decoded.userID;
    
    console.log(`👤 Extracted user ID: ${userId} from decoded:`, decoded);

    if (!userId) {
      console.log("❌ No user ID found in token");
      console.log("🔍 Available properties in decoded token:", Object.keys(decoded));
      res.clearCookie("token");
      return res.status(401).json({ 
        success: false, 
        message: "User ID not found in token" 
      });
    }

    // Set isActive to false in database
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { 
        isActive: false,
        lastActive: new Date()
      },
      { new: true }
    );

    // Check if user was found and updated
    if (!updatedUser) {
      console.log(`❌ User not found with ID: ${userId}`);
      res.clearCookie("token");
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log(`✅ User ${userId} isActive set to: ${updatedUser.isActive}`);

    // Clear cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
    });

    console.log("🍪 Cookie cleared successfully");

    return res.status(200).json({ 
      success: true, 
      message: "Logout successful",
      userUpdated: {
        id: userId,
        isActive: updatedUser.isActive
      }
    });

  } catch (error) {
    console.error("💥 Logout Error:", error);
    
    // Clear cookie even on error
    res.clearCookie("token");
    
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};


export const GetAllUser = async (req, res) => {

  try {
    const AllUser = await User.find();
    res.status(200).json(AllUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}











export const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Update user to remove profile image
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $unset: {
          profileImage: 1,
          profilePhoto: 1,
          'personalInfo.profileImage': 1
        },
        $set: {
          updatedAt: new Date()
        }
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile image removed successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Delete profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove profile image',
      error: error.message
    });
  }
};



export const uploadProfileImage = async (req, res) => {
  try {
    console.log("🎯 UPLOAD FUNCTION CALLED");
    console.log("📥 Upload profile image request received");
    console.log("🔐 User from auth:", req.user);
    console.log("📁 File details:", req.file);
    console.log("📦 Request body:", req.body);

    const userId = req.body.userId || req.user?._id;
    console.log("👤 Final User ID:", userId);

    if (!userId) {
      console.log("❌ Missing user ID");
      return res.status(400).json({
        success: false,
        message: "Missing user ID"
      });
    }

    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    console.log("☁️ Uploading to Cloudinary...");

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "matrimony/profiles",
      public_id: `profile_${userId}_${Date.now()}`,
      transformation: [
        { width: 500, height: 500, crop: "fill", gravity: "face" },
        { quality: "auto:good" },
        { format: "jpg" },
      ],
    });

    console.log("✅ Cloudinary upload complete:", uploadResult.secure_url);

    // Delete local file
    try {
      await fs.unlink(req.file.path);
      console.log("🗑️ Local file deleted");
    } catch (unlinkError) {
      console.log("⚠️ Could not delete local file:", unlinkError.message);
    }

    // Update DB
    console.log("💾 Updating database...");
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          profilePhoto: uploadResult.secure_url,
          profileImage: uploadResult.secure_url,
          "personalInfo.profileImage": uploadResult.secure_url,
          updatedAt: new Date()
        },
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!updatedUser) {
      console.log("❌ User not found in DB");
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("✅ User updated in DB:", updatedUser._id);
    console.log("📸 Profile image URLs saved:");
    console.log("   - profileImage:", updatedUser.profileImage);
    console.log("   - profilePhoto:", updatedUser.profilePhoto);
    console.log("   - personalInfo.profileImage:", updatedUser.personalInfo?.profileImage);

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      imageUrl: uploadResult.secure_url,
      user: updatedUser,
    });

  } catch (error) {
    console.error("❌ UPLOAD ERROR:", error);
    console.error("❌ Error stack:", error.stack);

    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        await fs.unlink(req.file.path);
        console.log("🗑️ Cleaned up file after error");
      } catch (unlinkError) {
        console.log("⚠️ Could not delete file on error:", unlinkError.message);
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload profile image",
      error: error.message,
    });
  }
};


export const checkStatusOnline = async (req, res) => {
  try {
    const { id } = req.params; // get user ID from URL

     console.log("this is the userid" , id)

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find the user without updating anything
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "User status retrieved successfully",
      isActive: user.isActive, // just return the status
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get status.",
      error: error.message,
    });
  }
};
