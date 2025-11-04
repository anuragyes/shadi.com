
// import Reel from '../Models/reel.js';



// export const uploader = async (req, res) => {

//     try {
//         const { userId } = req.body;
//         if (!userId) {
//             return res.status(400).json({ message: 'User ID is required' });
//         }


//         if (!req.file) {
//             return res.status(400).json({ message: 'No video file uploaded' });
//         }

//         // In a real app, you'd upload to Cloudinary/AWS S3 here
//         // For demo, we'll use the local file path
//         const videoUrl = `/uploads/${req.file.filename}`;

//         const reel = new Reel({
//             userId: req.user._id,
//             videoUrl,
//             caption,
//             hashtags: hashtags ? hashtags.split(',').map(tag => tag.trim()) : [],
//             size: req.file.size
//         });

//         await reel.save();

//         // Populate user details
//         await reel.populate('userId', 'name email');

//         res.status(201).json({
//             message: 'Reel uploaded successfully',
//             reel
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }


// export const getReels = async (req, res) => {
//     try {
//         const userId = req.params.id; // get from URL param  if directly want to get  id 

//         if (!userId) {
//             return res.status(400).json({ message: "User ID is required" });
//         }

//         // fetch all reels belonging to that user
//         const reels = await Reel.find({ userId }).sort({ createdAt: -1 });

//         res.status(200).json(reels);
//     } catch (error) {
//         console.error("Error fetching reels:", error);
//         res.status(500).json({ message: "Server Error", error: error.message });
//     }
// };



// export const getAllReels = async (req, res) => {
//     try {
//         const reels = await Reel.find()
//             .populate('userId', 'name email')
//             .sort({ createdAt: -1 });
//         res.json(reels);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }





// export const likeUnlikeReel = async (req, res) => {
//     try {
//         const reelId = req.params.id;
//         const userId = req.user._id;
//         const reel = await Reel.findById(reelId);
//         if (!reel) {
//             return res.status(404).json({ message: 'Reel not found' });
//         }
//         const index = reel.likes.indexOf(userId);
//         if (index === -1) {
//             reel.likes.push(userId);
//             await reel.save();
//             return res.json({ message: 'Reel liked' });
//         }
//         reel.likes.splice(index, 1);
//         await reel.save();
//         res.json({ message: 'Reel unliked' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }




// backend/Controllers/ReelController.js
import Reel from "../Models/reel.js";
import cloudinary from '../config/Cloudinary.js';
import User from '../Models/UserModel.js';

// backend/Controllers/ReelController.js
export const uploader = async (req, res) => {
  try {
    // Multer puts the file in req.file and form fields in req.body
    const { caption, privacy = 'public', userId } = req.body;
    
    console.log("📨 Received upload request:");
    console.log("User ID from frontend:", userId);
    console.log("File:", req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file');

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No media file uploaded' 
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID is required' 
      });
    }

    // Determine resource type for Cloudinary
    const resourceType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    console.log(`📤 Uploading ${resourceType} to Cloudinary...`);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: 'matrimonial/reels',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary upload successful:', result.public_id);
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // Create new reel in database
    const reel = new Reel({
      userId: userId,
      mediaUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      mediaType: resourceType,
      caption: caption || '',
      privacy: privacy,
      size: req.file.size,
      duration: uploadResult.duration || 0,
      dimensions: uploadResult.width && uploadResult.height ? {
        width: uploadResult.width,
        height: uploadResult.height
      } : null
    });

    await reel.save();
    console.log('✅ Reel saved to database with ID:', reel._id);

    // Populate user details for response
    await reel.populate('userId', 'personalInfo firstName lastName profilePhoto');

    console.log('✅ Upload completed successfully for user:', userId);

    res.status(201).json({
      success: true,
      message: `${resourceType === 'video' ? 'Reel' : 'Image'} uploaded successfully`,
      data: {
        _id: reel._id,
        mediaUrl: reel.mediaUrl,
        mediaType: reel.mediaType,
        caption: reel.caption,
        privacy: reel.privacy,
        duration: reel.duration,
        user: {
          _id: reel.userId._id,
          name: `${reel.userId.personalInfo?.firstName || ''} ${reel.userId.personalInfo?.lastName || ''}`.trim(),
          profilePhoto: reel.userId.profilePhoto
        },
        createdAt: reel.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during upload'
    });
  }
};

// export const getAllReels = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, type } = req.query;
//     const skip = (page - 1) * limit;

//     let query = { privacy: { $in: ['public', 'friends'] } };
    
//     // Filter by media type if provided
//     if (type && ['image', 'video'].includes(type)) {
//       query.mediaType = type;
//     }

//     const reels = await Reel.find(query)
//       .populate('userId', 'personalInfo firstName lastName profilePhoto isActive')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit))
//       .lean();

//     // Format response
//     const formattedReels = reels.map(reel => ({
//       _id: reel._id,
//       mediaUrl: reel.mediaUrl,
//       mediaType: reel.mediaType,
//       caption: reel.caption,
//       hashtags: reel.hashtags,
//       likes: reel.likes.length,
//       comments: reel.comments.length,
//       isLiked: reel.likes.includes(req.user._id),
//       user: {
//         _id: reel.userId._id,
//         name: `${reel.userId.personalInfo?.firstName || ''} ${reel.userId.personalInfo?.lastName || ''}`.trim(),
//         profilePhoto: reel.userId.profilePhoto,
//         isActive: reel.userId.isActive
//       },
//       duration: reel.duration,
//       createdAt: reel.createdAt
//     }));

//     const total = await Reel.countDocuments(query);
//     const totalPages = Math.ceil(total / limit);

//     res.json({
//       success: true,
//       data: formattedReels,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages,
//         totalReels: total,
//         hasNext: page < totalPages,
//         hasPrev: page > 1
//       }
//     });

//   } catch (error) {
//     console.error('Get all reels error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error fetching reels'
//     });
//   }
// };

export const getReels = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("🔍 Fetching reels for user ID:", userId);
    console.log("🔍 Request user:", req.user); // Debug what's in req.user
    
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Safe access to req.user with fallbacks
    const authenticatedUserId = req.user?._id ? req.user._id.toString() : null;
    const requestedUserId = userId;

    console.log("🔍 Authenticated user ID:", authenticatedUserId);
    console.log("🔍 Requested user ID:", requestedUserId);

    // If no authenticated user, only show public reels
    let privacyFilter = { $in: ['public'] };
    
    if (authenticatedUserId) {
      // Check if user is viewing their own reels
      const isOwnProfile = requestedUserId === authenticatedUserId;
      console.log("🔍 Is own profile?", isOwnProfile);
      
      if (isOwnProfile) {
        privacyFilter = { $in: ['public', 'friends', 'private'] };
        console.log("🔍 Showing all reels (including private) for own profile");
      } else {
        privacyFilter = { $in: ['public', 'friends'] };
        console.log("🔍 Showing public/friends reels for other user");
      }
    } else {
      console.log("🔍 No authenticated user, showing only public reels");
    }

    // Build query
    const query = { 
      userId: requestedUserId, 
      privacy: privacyFilter 
    };

    console.log("🔍 Database query:", JSON.stringify(query, null, 2));

    const reels = await Reel.find(query)
      .populate('userId', 'personalInfo firstName lastName profilePhoto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    console.log("🔍 Found reels:", reels.length);

    // Safe mapping with fallbacks
    const formattedReels = reels.map(reel => {
      const isLiked = authenticatedUserId && reel.likes 
        ? reel.likes.some(likeId => likeId.toString() === authenticatedUserId)
        : false;

      return {
        _id: reel._id,
        mediaUrl: reel.mediaUrl,
        mediaType: reel.mediaType,
        caption: reel.caption || '',
        hashtags: reel.hashtags || [],
        privacy: reel.privacy || 'public',
        likes: reel.likes ? reel.likes.length : 0,
        comments: reel.comments ? reel.comments.length : 0,
        isLiked: isLiked,
        duration: reel.duration || 0,
        dimensions: reel.dimensions || null,
        size: reel.size || 0,
        createdAt: reel.createdAt,
        user: reel.userId ? {
          _id: reel.userId._id,
          name: `${reel.userId.personalInfo?.firstName || ''} ${reel.userId.personalInfo?.lastName || ''}`.trim() || 'Unknown User',
          profilePhoto: reel.userId.profilePhoto
        } : null
      };
    });

    const total = await Reel.countDocuments(query);
    console.log("🔍 Total reels found:", total);

    res.json({
      success: true,
      data: formattedReels,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReels: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Get user reels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user reels',
      error: error.message
    });
  }
};

  // like unlike controleers 
export const likeUnlikeReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const userId = req.user._id;

    const reel = await Reel.findById(reelId);
    
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    const isLiked = reel.likes.includes(userId);
    
    if (isLiked) {
      // Unlike
      reel.likes = reel.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like
      reel.likes.push(userId);
    }

    await reel.save();

    res.json({
      success: true,
      message: isLiked ? 'Reel unliked' : 'Reel liked',
      data: {
        likes: reel.likes.length,
        isLiked: !isLiked
      }
    });

  } catch (error) {
    console.error('Like/unlike error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing like'
    });
  }
};

// Delete reel
export const deleteReel = async (req, res) => {
  try {
    const { reel_id, user_id } = req.body;

    console.log("🗑️ Deleting reel:", { reel_id, user_id });

    const reel = await Reel.findOne({ _id: reel_id, userId: user_id });
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "Reel not found or unauthorized"
      });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(reel.publicId, {
      resource_type: reel.mediaType
    });

    // Delete from database
    await Reel.findByIdAndDelete(reel_id);

    // Remove from user's gallery
    await User.findByIdAndUpdate(user_id, {
      $pull: { gallery: { publicId: reel.publicId } }
    });

    return res.json({
      success: true,
      message: "Reel deleted successfully"
    });
  } catch (error) {
    console.error("❌ Delete reel error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting reel"
    });
  }
};




export const getAllReels = async (req, res) => {
  try {
    // Fetch all reels from the database
    const reels = await Reel.find()
      .populate('userId', 'firstName lastName profilePhoto')
      .sort({ createdAt: -1 }); // Optional: newest first

    // Send all reels to frontend
    res.status(200).json({
      success: true,
      data: reels
    });
  } catch (error) {
    console.error('❌ Error fetching reels:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching reels'
    });
  }
};
