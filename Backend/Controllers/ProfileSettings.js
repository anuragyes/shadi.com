import mongoose from "mongoose";
import ProfileSettings from "../Models/ProfileView.js"



export const ProfileVisibility = async (req, res) => {
    try {
        const { userId, isVisible } = req.params;

        // Validation
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
            });
        }

        // Convert param to visibility
        const visibility =
            isVisible === "true" || isVisible === true ? "private" : "public";

        //  Save / Update in DB
        const settings = await ProfileSettings.findOneAndUpdate(
            { userId }, // ✅ VERY IMPORTANT
            { profileVisibility: visibility },
            {
                new: true,
                upsert: true, // creates document if not exists
                setDefaultsOnInsert: true,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Profile visibility updated successfully",
            profileVisibility: settings.profileVisibility,
        });
    } catch (error) {
        console.error("ProfileVisibility Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};



//    get method to get the visiblity status 
export const getProfileVisiblity = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
            });
        }

        // Find user's profile settings
        const settings = await ProfileSettings.findOne({ userId });

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: "Profile settings not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile visibility fetched successfully",
            visibility: settings.profileVisibility,
        });
    } catch (error) {
        console.error("getProfileVisibility Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};





export const LastSeenVisibility = async (req, res) => {
    try {
        const { userId, isVisibleLastSeen } = req.params;

        // Validation
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
            });
        }

        // Convert param to visibility
        const visibility =
            isVisibleLastSeen === "true" || isVisibleLastSeen === true ? "true" : "false";

        //  Save / Update in DB
        const visiblelastSeen = await ProfileSettings.findOneAndUpdate(
            { userId }, // ✅ VERY IMPORTANT
            {
                showLastSeen: visibility
            },
            {
                new: true,
                upsert: true, // creates document if not exists
                setDefaultsOnInsert: true,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Last seen visibility updated successfully",
            showLastSeen: visiblelastSeen.
                showLastSeen,
        });
    } catch (error) {
        console.error("ProfileVisibility Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};










//  now move to check last seen visible or not seen 


export const getLastSeen = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
            });
        }


        const settings = await ProfileSettings.findOne({ userId });

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: "Last seen settings not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Last seen fetched successfully",
            lastSeen: settings.showLastSeen,
        });
    } catch (error) {
        console.error("LastSeen Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};





//   set the online off line stsuas 


export const SetOnlineOffLineStatus = async (req, res) => {
  try {
    const { userId, isOnline } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId not found",
      });
    }

    // Convert param to boolean
    const onlineStatus =
      isOnline === "true" || isOnline === true ? true : false;

    //  Save in DB
    const settings = await ProfileSettings.findOneAndUpdate(
      { userId },
      { showOnlineStatus: onlineStatus },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Online status updated successfully",
      onlineStatus: settings.showOnlineStatus,
    });
  } catch (error) {
    console.error("SetOnlineOffLineStatus Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// get the staust online or offline 
export const getShowOnline = async (req, res) => {


    try {

        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "id requreid", success: false });
        }

        const checkuser = await ProfileSettings.findOne({ userId });


        if (!checkuser) {
            return res.status(400).json({ message: "user not found ", success: false });
        }

        return res.status(200).json({
            success: true,
            message: "get online status successfully",
            LastSeenOnline: checkuser.showOnlineStatus,

        })






    } catch (error) {

        console.log("Error Something went wrong", error);
        res.status(500).json({
            message: error,
            success: false,
        })
    }
}