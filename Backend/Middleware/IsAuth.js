import jwt from "jsonwebtoken"
export const isAuth = async (req, res, next) => {
  try {

    const token = req.cookies.token;
    // console.log(token);
    if (!token) {
      return res.status(401).json({ message: "Token not found" })
    }

    const verifyToken = await jwt.verify(token, process.env.JWT_SECRET);

    req.userId = verifyToken.userId;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Token error" })
  }
}