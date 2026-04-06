// middleware/auth.js
import jwt from "jsonwebtoken";
import config from "../config/appConfig.js";
import { findUserById } from "../models/userModel.js";

const getBearerToken = (req) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice(7).trim();
};

/**
 * Accepts a Bearer access token in the Authorization header.
 * Sets req.user = { id } when valid.
 */
export const verifyToken = (req, res, next) => {
  const bearer = getBearerToken(req);

  if (!bearer) {
    return res.status(401).json({ message: "Bearer token required." });
  }

  try {
    if (!config.jwtSecret) {
      return res.status(500).json({ message: "JWT_SECRET is not configured." });
    }

    const decoded = jwt.verify(bearer, config.jwtSecret);
    req.user = { id: decoded.id };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const verifySession = (req, res, next) => {
  const sessionToken = req.cookies?.[config.refreshCookieName];
  if (!sessionToken) {
    return res.status(401).json({ message: "Session cookie required." });
  }

  try {
    const decoded = jwt.verify(sessionToken, config.jwtRefreshSecret);
    req.user = { id: decoded.id };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid session" });
  }
};

export const verifyAdmin = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Authorization error" });
  }
};
