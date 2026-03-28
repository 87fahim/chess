// middleware/auth.js
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import db from "../db/connection.js";

/**
 * Accepts either:
 *  - Bearer access token in Authorization header  OR
 *  - HttpOnly refresh cookie (refreshToken)
 * Sets req.user = { id } when valid.
 */
export const verifyToken = (req, res, next) => {
  const bearer = req.headers["authorization"]?.split(" ")[1];
  const cookieToken = req.cookies?.refreshToken;

  if (!bearer && !cookieToken) {
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    if (bearer) {
      const decoded = jwt.verify(bearer, process.env.JWT_SECRET);
      req.user = { id: decoded.id };
      return next();
    }
    const decoded = jwt.verify(cookieToken, process.env.JWT_REFRESH_SECRET);
    req.user = { id: decoded.id };
    return next();
  } catch (err) {
    console.error("Invalid token:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const verifyAdmin = async (req, res, next) => {
  try {
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({
      _id: new ObjectId(req.user.id),
    });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Authorization error", error });
  }
};
