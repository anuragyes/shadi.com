import Story from "../Models/Story.js";
import cloudinary from '../config/Cloudinary.js';
import User from "../Models/UserModel.js";
import ChatRequest from "../Models/ChatstartRequest.js";
import mongoose from "mongoose";



export const uploadStory = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("🔥 STORY UPLOAD HIT");
    console.log("➡️ User ID:", userId);

    // 1. Check file
    if (!req.file) {
      console.log("❌ No file received from frontend");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📦 File received:");
    console.log("   - originalname:", req.file.originalname);
    console.log("   - mimetype:", req.file.mimetype);
    console.log("   - size:", req.file.size);

    const file = req.file;
    const isVideo = file.mimetype.startsWith("video");

    console.log("🎥 Is Video?:", isVideo);

    // 2. Upload to Cloudinary
    console.log("☁️ Uploading to Cloudinary...");

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "matrimonial/stories",
          resource_type: isVideo ? "video" : "image",
        },
        (err, result) => {
          if (err) {
            console.log("❌ Cloudinary Error:", err);
            reject(err);
          } else {
            console.log("✅ Cloudinary Upload Success:");
            console.log("   - URL:", result.secure_url);
            console.log("   - Public ID:", result.public_id);
            resolve(result);
          }
        }
      );

      stream.end(file.buffer);
    });

    // 3. SAVE STORY INTO STORIES ARRAY (IMPORTANT)
    console.log("📝 Saving Story into DB...");

    const storyData = {
      imageUrl: isVideo ? null : uploadResult.secure_url,
      videoUrl: isVideo ? uploadResult.secure_url : null,
      expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date()
    };

    let userStories = await Story.findOne({ userId });

    if (!userStories) {
      // First time user uploads a story → create main document
      userStories = await Story.create({
        userId,
        stories: [storyData]
      });
    } else {
      // User already has document → push new story
      userStories.stories.push(storyData);
      await userStories.save();
    }

    console.log("✅ Story Saved in DB:");
    console.log(userStories);

    // 4. Response
    console.log("🎉 Story Upload Completed Successfully!");

    return res.status(200).json({
      message: "Story uploaded",
      stories: userStories.stories    // return all stories
    });

  } catch (error) {
    console.error("❌ Upload Story Error:", error);
    return res.status(500).json({ error: error.message });
  }
};




export const getActiveStories = async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();

    const userStories = await Story.findOne({ userId });

    // console.log("this is userStories", userStories);

    if (!userStories) return res.json({ storyId: null, stories: [] });

    const activeStories = userStories.stories.filter(
      story => new Date(story.expireAt) > now
    );

    res.json({
      storyId: userStories._id,   // <-- SEND MONGO DOCUMENT ID HERE
      stories: activeStories
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching stories" });
  }
};



export const getAllStories = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID required",
      });
    }

    // 1️⃣ Get accepted friends
    const connections = await ChatRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "accepted",
    }).lean();

    const friendIds = connections
      .map(c => {
        const senderId = c.sender.toString();
        const receiverId = c.receiver.toString();
        return senderId === userId
          ? receiverId
          : receiverId === userId
          ? senderId
          : null;
      })
      .filter(Boolean);

    //  dont add self + friends  just add only and only freiend story 
    const allUserIds = [...friendIds]; 

    // 2️⃣ Fetch stories
    const stories = await Story.find({
      userId: { $in: allUserIds },
    }).lean();

    // 3️⃣ Fetch user details (username) 🔥
    const users = await User.find({
      _id: { $in: allUserIds },
    })
      .select("personalInfo.firstName personalInfo.lastName avatar username")
      .lean();

    // Create userId -> user map
    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = u;
    });

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    // 4️⃣ Apply expiry + attach username
    const filteredStories = stories
      .map(story => {
        const owner = userMap[story.userId.toString()];
        if (!owner) return null;

        const validItems = story.stories.filter(item => {
          return now - new Date(item.createdAt).getTime() <= DAY;
        });

        if (validItems.length === 0) return null;

        return {
          userId: story.userId,
          displayName: `${owner.personalInfo?.firstName || ""} ${owner.personalInfo?.lastName || ""}`.trim(),
          avatar: owner.avatar || null,
          isYourStory: story.userId.toString() === userId,

          items: validItems.map(s => ({
            id: s._id,
            type: s.imageUrl ? "image" : "video",
            url: s.imageUrl || s.videoUrl,
            caption: s.caption || "",
            createdAt: s.createdAt,
            duration: s.imageUrl ? 5000 : 10000,
          })),
        };
      })
      .filter(Boolean);

    return res.json({
      success: true,
      stories: filteredStories,
    });
  } catch (error) {
    console.error("❌ getAllStories error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};





// export const getAllStories = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!userId) {
//       return res.status(400).json({ success: false, message: "User ID is required" });
//     }

//     // 1️⃣ Find accepted chat connections of this user
//     const acceptedConnections = await ChatRequest.find({
//       $or: [{ sender: userId }, { receiver: userId }],
//       status: "accepted",
//     }).lean();

//     // 2️⃣ Extract friendIds (FIXED)
//     const friendIds = acceptedConnections
//       .map(cr => {
//         const senderId = cr.sender.toString();      // here i do mistake in my attenpt i compared directly so thats why the issue 
//         const receiverId = cr.receiver.toString();

//         return senderId === userId
//           ? receiverId
//           : receiverId === userId
//             ? senderId
//             : null;
//       })
//       .filter(Boolean);

//     // Include own id + friend ids
//     const allUserIds = friendIds;

//     // 3️⃣ Fetch all stories of user & friends
//     const allStories = await Story.find({
//       userId: { $in: allUserIds },
//     })
//       .sort({ createdAt: -1 })
//       .lean();

//     // 4️⃣ Fetch user details in ONE query (optimization)
//     const users = await User.find({ _id: { $in: allUserIds } })
//       .select("personalInfo firstName lastName avatar email")
//       .lean();

//     const userMap = {};
//     users.forEach(u => (userMap[u._id.toString()] = u));

//     // 5️⃣ Build response
//     const mappedStories = allStories
//       .map(story => {
//         const user = userMap[story.userId.toString()];
//         if (!user) return null;

//         const items = Array.isArray(story.stories)
//           ? story.stories.map(s => ({
//             id: s._id,
//             type: s.imageUrl ? "image" : "video",
//             url: s.imageUrl || s.videoUrl,
//             caption: s.caption || "",
//             createdAt: s.createdAt,
//             duration: s.imageUrl ? 5000 : 10000,
//           }))
//           : [];

//         return {
//           id: story._id,
//           userId: story.userId,
//           username: `${user.personalInfo?.firstName || ""} ${user.personalInfo?.lastName || ""
//             }`.trim(),
//           avatar: user.avatar || null,
//           items,
//           isYourStory: story.userId.toString() === userId,
//           hasStory: items.length > 0,
//         };
//       })
//       .filter(Boolean);

//     return res.json({ success: true, stories: mappedStories });
//   } catch (error) {
//     console.error("❌ Error in getAllStories:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };




export const deleteStoryItem = async (req, res) => {
  try {
    const { storyId, itemId } = req.params;

    console.log("this is storyId", storyId);
    console.log("this is itemId", itemId);

    if (!storyId || !itemId) {
      return res.status(400).json({
        success: false,
        message: "storyId and itemId are required",
      });
    }

    const updatedStory = await Story.findByIdAndUpdate(
      storyId,
      {
        $pull: { stories: { _id: new mongoose.Types.ObjectId(itemId) } }
      },
      { new: true }
    );

    if (!updatedStory) {
      return res.status(404).json({
        success: false,
        message: "Story or item not found",
      });
    }

    return res.json({
      success: true,
      message: "Story item deleted successfully",
      story: updatedStory,
    });

  } catch (error) {
    console.error("deleteStoryItem Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


