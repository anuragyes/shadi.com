import ChatRequest from "../Models/ChatstartRequest.js";
import User from "../Models/UserModel.js";
import mongoose from "mongoose";

// export const MutualFriend = async (req, res) => {
//     try {


//         const {currentuser} = req.params;
//         const { frienduser } = req.params;


//          console.log("this is currentuserid" , currentuser);
//        console.log("this is   frienduserid" , frienduser);

//         if (!currentuser || !frienduser) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Both currentuser and frienduser are required",
//             });
//         }

//         // Step 1: Find all accepted friends of current user
//         const currentUserFriends = await ChatRequest.find({
//             $or: [
//                 { sender: currentuser },
//                 { receiver: currentuser },
//             ],
//             status: "accepted",
//         });

//         // ✅ Step 2: Find all accepted friends of friend user
//         const friendUserFriends = await ChatRequest.find({
//             $or: [
//                 { sender: frienduser },
//                 { receiver: frienduser },
//             ],
//             status: "accepted",
//         });

//         // ✅ Step 3: Extract friend IDs (normalize)
//         const currentUserFriendIds = currentUserFriends.map(req =>
//             req.sender.toString() === currentuser
//                 ? req.receiver.toString()
//                 : req.sender.toString()
//         );

//         const friendUserFriendIds = friendUserFriends.map(req =>
//             req.sender.toString() === frienduser
//                 ? req.receiver.toString()
//                 : req.sender.toString()
//         );

//         // ✅ Step 4: Find mutual friends (intersection)
//         const mutualFriendIds = currentUserFriendIds.filter(id =>
//             friendUserFriendIds.includes(id)
//         );

//         // remove duplicates (safety)
//         const uniqueMutualFriendIds = [...new Set(mutualFriendIds)];

//         return res.status(200).json({
//             success: true,
//             mutualCount: uniqueMutualFriendIds.length,
//             mutualFriendIds: uniqueMutualFriendIds,
//         });

//     } catch (error) {
//         console.error("MutualFriend Error:", error);
//         res.status(500).json({
//             success: false,
//             message: "Server error",
//         });
//     }
// };





export const MutualFriend = async (req, res) => {
  try {


    const { currentuser } = req.params;
    const { frienduser } = req.params;

    console.log("currentuser:", currentuser);
    console.log("frienduser:", frienduser);

    if (!currentuser || !frienduser) {
      return res.status(400).json({
        success: false,
        message: "Both currentuser and frienduser are required",
      });
    }

    // 🛡 Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(currentuser) ||
      !mongoose.Types.ObjectId.isValid(frienduser)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    // Step 1: current user friends
    const currentUserFriends = await ChatRequest.find({
      $or: [{ sender: currentuser }, { receiver: currentuser }],
      status: "accepted",
    });

    // Step 2: friend user friends
    const friendUserFriends = await ChatRequest.find({
      $or: [{ sender: frienduser }, { receiver: frienduser }],
      status: "accepted",
    });

    // Step 3: normalize friend IDs
    const currentUserFriendIds = currentUserFriends.map(r =>
      r.sender.toString() === currentuser
        ? r.receiver.toString()
        : r.sender.toString()
    );

    const friendUserFriendIds = friendUserFriends.map(r =>
      r.sender.toString() === frienduser
        ? r.receiver.toString()
        : r.sender.toString()
    );

    // Step 4: mutual IDs
    const mutualFriendIds = [...new Set(
      currentUserFriendIds.filter(id =>
        friendUserFriendIds.includes(id)
      )
    )];

    // Step 5: FETCH USER DETAILS 🔥


    const mutualFriends = await User.find({
      _id: { $in: mutualFriendIds }
    }).select(
      "personalInfo.firstName personalInfo.lastName photos lastActive"
    );
    return res.status(200).json({
      success: true,
      mutualCount: mutualFriends.length,
      mutualFriends: mutualFriends.map(user => ({
        _id: user._id,
        firstName: user.personalInfo?.firstName,
        lastName: user.personalInfo?.lastName,
        photo: user.photos?.[0] || null,
        lastActive: user.lastActive
      }))
    });

  } catch (error) {
    console.error("MutualFriend Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
