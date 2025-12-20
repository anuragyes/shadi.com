import User from "../Models/UserModel.js"


export const updateprofileofUser = (req, body) => {

    try {
        const { user } = req.body();
        console.log("this is user deatials", user);
    } catch (error) {
        console.error("❌ Cancel Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

