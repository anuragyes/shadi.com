
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

// export const getUserById = async (req, res) => {
//   try {
//     const { id } = req.params; // Get the ID from the URL
//     if (!id) {
//       return res.status(400).json({ success: false, message: "User ID is required" });
//     }

//     // Find the user in MongoDB (exclude sensitive fields)
//     const user = await User.findById(id).select("-password -__v");

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Send back the user data
//     return res.status(200).json({ success: true, data: { user } });
//   } catch (error) {
//     console.error("Get User by ID Error:", error);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

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
// export const updateUserProfile = async (req, res) => {
//   try {
//     // Get userId from authenticated user (from middleware) instead of req.body
//     // const userId = req.user?.userId || req.user?._id;
//       const userId = req.body.id;
//     console.log("UserID:", userId);

//     if (!userId) {
//       return res.status(401).json({ 
//         success: false, 
//         message: "Unauthorized: No user ID found from token." 
//       });
//     }

//     let updates = req.body;

//     // Parse updates if they're sent as JSON string
//     if (typeof updates === 'string') {
//       try {
//         updates = JSON.parse(updates);
//       } catch (parseError) {
//         return res.status(400).json({ 
//           success: false, 
//           message: "Invalid JSON in request body." 
//         });
//       }
//     }

//     // Remove userId from updates if present to prevent security issues
//     if (updates.id || updates._id) {
//       delete updates.id;
//       delete updates._id;
//     }

//     if (!updates || Object.keys(updates).length === 0) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "No data provided for update." 
//       });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found." 
//       });
//     }

//     const deepMerge = (target, source) => {
//       for (const key in source) {
//         // Skip prototype properties and sensitive fields
//         if (!source.hasOwnProperty(key) || 
//             ['password', 'role', 'accountStatus', 'verification', 'subscription', 'moderation'].includes(key)) {
//           continue;
//         }

//         if (Array.isArray(source[key])) {
//           target[key] = source[key];
//         } else if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
//           if (!target[key] || typeof target[key] !== 'object') {
//             target[key] = {};
//           }
//           deepMerge(target[key], source[key]);
//         } else {
//           // Handle special cases for the new schema
//           if (key === 'dateOfBirth' && source[key] && target.personalInfo) {
//             target.personalInfo.dateOfBirth = new Date(source[key]);
//           } else {
//             target[key] = source[key];
//           }
//         }
//       }
//       return target;
//     };

//     // Apply updates safely
//     deepMerge(user, updates);

//     // Updated profile completion calculation for new schema
//     const calculateProgress = (u) => {
//       const completionFields = [
//         u.email,
//         u.personalInfo?.firstName,
//         u.personalInfo?.lastName,
//         u.personalInfo?.gender,
//         u.personalInfo?.dateOfBirth,
//         u.personalInfo?.maritalStatus,
//         u.religiousInfo?.religion,
//         u.religiousInfo?.motherTongue,
//         u.professionalInfo?.occupation,
//         u.professionalInfo?.highestEducation?.degree,
//         u.location?.current?.city,
//         u.location?.current?.country,
//         u.profilePhoto?.url
//       ];

//       const filledCount = completionFields.filter(val =>
//         val !== undefined && 
//         val !== null && 
//         val !== '' && 
//         !(Array.isArray(val) && val.length === 0) &&
//         !(typeof val === 'object' && Object.keys(val).length === 0) // Check for empty objects
//       ).length;

//       return Math.min(Math.round((filledCount / completionFields.length) * 100), 100);
//     };

//     user.profileCompletion = calculateProgress(user);

//     // Update lastActive timestamp
//     user.lastActive = new Date();

//     // Cloudinary upload helper
//     const uploadToCloudinary = async (file) => {
//       try {
//         const result = await cloudinary.uploader.upload(file.path, {
//           folder: "matrimony_users",
//           resource_type: "image",
//           transformation: [
//             { width: 500, height: 500, crop: "limit", quality: "auto" }
//           ]
//         });

//         // Safely delete file if it exists
//         if (fs.existsSync(file.path)) {
//           await fs.promises.unlink(file.path).catch(console.error);
//         }

//         return {
//           url: result.secure_url,
//           isApproved: false, // Default to false for moderation
//           uploadedAt: new Date()
//         };
//       } catch (uploadError) {
//         console.error("Cloudinary upload error:", uploadError);
//         throw new Error(`Failed to upload file: ${uploadError.message}`);
//       }
//     };

//     // 1️⃣ Profile photo upload (single)
//     if (req.files?.profilePhoto?.[0]) {
//       try {
//         const photoData = await uploadToCloudinary(req.files.profilePhoto[0]);
//         user.profilePhoto = {
//           url: photoData.url,
//           isVerified: false,
//           uploadedAt: photoData.uploadedAt
//         };
//       } catch (error) {
//         console.error("Profile photo upload failed:", error);
//         // Continue with other updates even if photo upload fails
//       }
//     }

//     // 2️⃣ Gallery photos upload (multiple)
//     if (req.files?.galleryPhotos?.length) {
//       try {
//         const galleryUploads = await Promise.all(
//           req.files.galleryPhotos.map((file) => uploadToCloudinary(file))
//         );

//         // Initialize gallery array if it doesn't exist
//         if (!user.gallery) {
//           user.gallery = [];
//         }

//         // Add new gallery photos with proper structure
//         galleryUploads.forEach((photoData, index) => {
//           user.gallery.push({
//             url: photoData.url,
//             isApproved: false,
//             isPrimary: false,
//             uploadedAt: photoData.uploadedAt,
//             sortOrder: user.gallery.length + index
//           });
//         });
//       } catch (error) {
//         console.error("Gallery photos upload failed:", error);
//       }
//     }

//     // 3️⃣ Verification documents upload
//     if (req.files?.documents?.length) {
//       try {
//         const docUploads = await Promise.all(
//           req.files.documents.map((file) => uploadToCloudinary(file))
//         );

//         // Initialize verificationDocuments array if it doesn't exist
//         if (!user.verification?.verificationDocuments) {
//           if (!user.verification) user.verification = {};
//           user.verification.verificationDocuments = [];
//         }

//         // Add document info (you might want to get document type from request body)
//         docUploads.forEach((docData) => {
//           user.verification.verificationDocuments.push({
//             type: 'aadhaar', // This should come from req.body or filename
//             url: docData.url,
//             verified: false,
//             uploadedAt: docData.uploadedAt
//           });
//         });
//       } catch (error) {
//         console.error("Document upload failed:", error);
//       }
//     }

//     // Validate before saving
//     try {
//       await user.validate();
//     } catch (validationError) {
//       console.error("Validation error before save:", validationError);
//       return res.status(400).json({
//         success: false,
//         message: "Validation failed",
//         errors: Object.values(validationError.errors).map(err => err.message)
//       });
//     }

//     await user.save();

//     // Get updated user without sensitive fields
//     const updatedUser = await User.findById(userId)
//       .select('-password -__v -verification.verificationDocuments -location.current.fullAddress')
//       .lean();

//     // Add virtual fields
//     updatedUser.age = user.age;
//     updatedUser.fullName = user.fullName;

//     res.status(200).json({
//       success: true,
//       message: `Profile updated successfully. Completion: ${user.profileCompletion}%`,
//       data: { 
//         user: updatedUser,
//         profileCompletion: user.profileCompletion,
//         isProfileComplete: user.profileCompletion >= 70 // You can adjust this threshold
//       },
//     });

//   } catch (error) {
//     console.error("Update Profile Error:", error);

//     if (error.name === "ValidationError") {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ 
//         success: false, 
//         message: "Validation failed during save.", 
//         errors 
//       });
//     }

//     if (error.name === "CastError") {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid user ID format." 
//       });
//     }

//     if (error.code === 11000) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Email already exists." 
//       });
//     }

//     res.status(500).json({ 
//       success: false, 
//       message: "Internal server error during profile update.",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };


// export const updateUserProfile = async (req, res) => {
//   try {


//       //  console.log("this is updated values",req.body.id);
//     const userId = req.body.id;
//     console.log("UserID:", userId);

//     if (!userId) {
//       return res.status(401).json({ 
//         success: false, 
//         message: "Unauthorized: No user ID found from token." 
//       });
//     }

//     const updates = req.body;

//     // Parse updates if they're sent as JSON string
//     if (typeof updates === 'string') {
//       try {
//         updates = JSON.parse(updates);
//       } catch (parseError) {
//         return res.status(400).json({ 
//           success: false, 
//           message: "Invalid JSON in request body." 
//         });
//       }
//     }

//     if (!updates || Object.keys(updates).length === 0) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "No data provided for update." 
//       });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found." 
//       });
//     }

//     const deepMerge = (target, source) => {
//       for (const key in source) {
//         // Skip prototype properties
//         if (!source.hasOwnProperty(key)) continue;

//         if (Array.isArray(source[key])) {
//           target[key] = source[key];
//         } else if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
//           if (!target[key] || typeof target[key] !== 'object') {
//             target[key] = {};
//           }
//           deepMerge(target[key], source[key]);
//         } else {
//           target[key] = source[key];
//         }
//       }
//       return target;
//     };

//     // Apply updates safely
//     deepMerge(user, updates);

//     const calculateProgress = (u) => {
//       const completionFields = [
//         u.personalInfo?.firstName, 
//         u.personalInfo?.lastName, 
//         u.personalInfo?.gender, 
//         u.personalInfo?.dateOfBirth,
//         u.religiousInfo?.religion, 
//         u.religiousInfo?.motherTongue,
//         u.professionalInfo?.occupation,
//         u.familyInfo?.familyType,
//         u.lifestyleInfo?.diet,
//         u.aboutMe?.description,
//         u.partnerPreferences?.ageRange?.min,
//       ];

//       const filledCount = completionFields.filter(val =>
//         val !== undefined && 
//         val !== null && 
//         val !== '' && 
//         !(Array.isArray(val) && val.length === 0)
//       ).length;

//       return Math.min(Math.round((filledCount / completionFields.length) * 100), 100);
//     };

//     user.profileCompletion = calculateProgress(user);
//     user.isProfileComplete = user.profileCompletion >= 80;

//     // Cloudinary upload helper
//     const uploadToCloudinary = async (file) => {
//       try {
//         const result = await cloudinary.uploader.upload(file.path, {
//           folder: "user_uploads",
//           resource_type: "auto",
//         });

//         // Safely delete file if it exists
//         if (fs.existsSync(file.path)) {
//           await fs.promises.unlink(file.path).catch(console.error);
//         }

//         return result.secure_url;
//       } catch (uploadError) {
//         console.error("Cloudinary upload error:", uploadError);
//         // Don't delete file if upload failed for debugging
//         throw new Error(`Failed to upload file: ${uploadError.message}`);
//       }
//     };

//     // 1️⃣ Single profile photo upload
//     if (req.files?.photo?.[0]) {
//       try {
//         const photoUrl = await uploadToCloudinary(req.files.photo[0]);
//         user.photoUrl = photoUrl;
//       } catch (error) {
//         console.error("Profile photo upload failed:", error);
//         // Continue with other updates even if photo upload fails
//       }
//     }

//     // 2️⃣ Multiple photo uploads (gallery / post images)
//     if (req.files?.multiplePhotos?.length) {
//       try {
//         const photoUploads = await Promise.all(
//           req.files.multiplePhotos.map((file) => uploadToCloudinary(file))
//         );

//         // Initialize multiplePhotos array if it doesn't exist
//         if (!user.multiplePhotos) {
//           user.multiplePhotos = [];
//         }

//         user.multiplePhotos.push(...photoUploads);
//       } catch (error) {
//         console.error("Multiple photos upload failed:", error);
//         // Continue with other updates even if multiple photos upload fails
//       }
//     }

//     // Validate before saving
//     try {
//       await user.validate();
//     } catch (validationError) {
//       console.error("Validation error before save:", validationError);
//       return res.status(400).json({
//         success: false,
//         message: "Validation failed",
//         errors: Object.values(validationError.errors).map(err => err.message)
//       });
//     }

//     await user.save();

//     const updatedUser = await User.findById(userId).select('-password -__v');

//     res.status(200).json({
//       success: true,
//       message: `Profile updated successfully. Completion: ${updatedUser.profileCompletion}%`,
//       data: { user: updatedUser },
//     });

//   } catch (error) {
//     console.error("Update Profile Error:", error);

//     if (error.name === "ValidationError") {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ 
//         success: false, 
//         message: "Validation failed during save.", 
//         errors 
//       });
//     }

//     if (error.name === "CastError") {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid user ID format." 
//       });
//     }

//     res.status(500).json({ 
//       success: false, 
//       message: "Internal server error during profile update.",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// ======================================
// 🔐 LOGIN CONTROLLER
// ======================================
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
      gender: user.personalInfo?.gender || "unknown",
      subscription: user.subscription?.plan || "free",
    };

    console.log("✅ LOGIN SUCCESS:", userData.email);

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
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
    });

    return res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
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















// export const uploadProfileImage = async (req, res) => {
//   try {
//     console.log("📥 Upload profile image request received");
//     console.log("File:", req.file);

//     const userId = req.body.userId || req.user?._id;
//     console.log("User ID:", userId);

//     if (!userId) return res.status(400).json({ success: false, message: "Missing user ID" });
//     if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

//     // Upload to Cloudinary
//     const uploadResult = await cloudinary.uploader.upload(req.file.path, {
//       folder: "matrimony/profiles",
//       public_id: `profile_${userId}_${Date.now()}`,
//       transformation: [
//         { width: 500, height: 500, crop: "fill", gravity: "face" },
//         { quality: "auto:good" },
//         { format: "jpg" },
//       ],
//     });

//     console.log("✅ Cloudinary upload complete:", uploadResult.secure_url);

//     // Delete local file
//     await fs.unlink(req.file.path);
//     console.log("🗑️ Local file deleted");

//     // Update DB (use findOneAndUpdate for reliability)
//     const updatedUser = await User.findOneAndUpdate(
//       { _id: new mongoose.Types.ObjectId(userId) },
//       {
//         $set: {
//           profilePhoto: uploadResult.secure_url,
//           "personalInfo.profileImage": uploadResult.secure_url,
//         },
//       },
//       { new: true }
//     );

//     if (!updatedUser) {
//       console.log("❌ User not found in DB");
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     console.log("✅ User updated in DB:", updatedUser._id);

//     res.status(200).json({
//       success: true,
//       message: "Profile image uploaded successfully",
//       imageUrl: uploadResult.secure_url,
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error("❌ Upload error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to upload profile image",
//       error: error.message,
//     });
//   }
// };




// export const uploadProfileImage = async (req, res) => {
//   try {
//     console.log("📥 Upload profile image request received");
//     console.log("File:", req.file);
//     console.log("User ID:", req.body.userId || req.user?._id);

//     if (!req.file) {
//       return res.status(400).json({ success: false, message: "No image file provided" });
//     }

//     const userId = req.body.userId || req.user?._id;
//     if (!userId) {
//       return res.status(400).json({ success: false, message: "User ID is required" });
//     }

//     // Read file from disk (since using diskStorage)
//     const fileData = await fs.readFile(req.file.path);
//     const base64Image = `data:${req.file.mimetype};base64,${fileData.toString('base64')}`;

//     // Upload to Cloudinary
//     const uploadResult = await cloudinary.uploader.upload(base64Image, {
//       folder: 'matrimony/profiles',
//       public_id: `profile_${userId}_${Date.now()}`,
//       transformation: [
//         { width: 500, height: 500, crop: 'fill', gravity: 'face' },
//         { quality: 'auto:good' },
//         { format: 'jpg' }
//       ]
//     });

//     console.log("✅ Cloudinary upload complete:", uploadResult.secure_url);

//     // Update user in MongoDB
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         $set: {
//           profilePhoto: uploadResult.secure_url,  // ✅ Correct key
//           updatedAt: new Date()
//         }
//       },
//       { new: true, runValidators: true }
//     ).select("-password");

//     if (!updatedUser) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Delete local file AFTER Cloudinary upload
//     await fs.unlink(req.file.path);
//     console.log("🗑️ Local file deleted");

//     res.status(200).json({
//       success: true,
//       message: "Profile image uploaded successfully",
//       imageUrl: uploadResult.secure_url,
//       user: updatedUser
//     });
//   } catch (error) {
//     console.error("❌ Upload error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to upload profile image",
//       error: error.message
//     });
//   }
// };




// export const uploadProfileImage = async (req, res) => {
//   try {
//     console.log("📥 Upload profile image request received");
//     console.log("File:", req.file);
//     console.log("User ID:", req.body.userId || req.user?.id);

//     const userId = req.body.userId || req.user?.id;
//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: 'User ID is required'
//       });
//     }

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: 'No image file provided'
//       });
//     }

//     // Upload to Cloudinary from file path
//     const uploadResult = await cloudinary.uploader.upload(req.file.path, {
//       folder: 'matrimony/profiles',
//       public_id: `profile_${userId}_${Date.now()}`,
//       transformation: [
//         { width: 500, height: 500, crop: 'fill', gravity: 'face' },
//         { quality: 'auto:good' },
//         { format: 'jpg' }
//       ]
//     });

//     // Delete the local file after upload
//     fs.unlink(req.file.path, (err) => {
//       if (err) console.error("⚠️ Failed to delete local file:", err);
//       else console.log("🗑️ Local file deleted");
//     });

//     // Update user in database
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         $set: {
//           profileImage: uploadResult.secure_url,
//           profilePhoto: uploadResult.secure_url,
//           'personalInfo.profileImage': uploadResult.secure_url,
//           updatedAt: new Date()
//         }
//       },
//       { new: true, runValidators: true }
//     ).select('-password');

//     if (!updatedUser) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     console.log("✅ User profile updated in database");

//     res.status(200).json({
//       success: true,
//       message: 'Profile image uploaded successfully',
//       imageUrl: uploadResult.secure_url,
//       user: updatedUser
//     });

//   } catch (error) {
//     console.error('❌ Upload error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to upload profile image',
//       error: error.message
//     });
//   }
// };


// Delete profile image
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