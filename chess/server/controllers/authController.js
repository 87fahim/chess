// controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  findUserById,
  findUserByUsername,
  insertUser,
} from "../models/userModel.js";

const inProd = process.env.NODE_ENV === "production";

// Use dev-friendly cookie flags locally, stricter in prod
const refreshCookieOptions = {
  httpOnly: true,
  secure: inProd,                     // true only on HTTPS (prod)
  sameSite: inProd ? "None" : "Lax",
  path: "/",                          // ✅ send cookie to ALL routes, not just /api/auth
  // maxAge: 7 * 24 * 60 * 60 * 1000, // optional: 7 days
};

// Register User
export const registerUser = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await insertUser({ username, password: passwordHash, email });

    return res
      .status(201)
      .json({ message: "User registered successfully", insertedId: result.insertedId });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Login User (sets HttpOnly refresh cookie; returns safe user + roles)
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const user = await findUserByUsername(username);
    if (!user) return res.status(401).json({ error: "Invalid username or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid username or password" });

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, refreshCookieOptions); // ✅ path: "/"

    const safeUser = { id: user._id, username: user.username, email: user.email };
    // TODO: replace with real roles from DB
    return res.json({ user: safeUser, roles: [2000, 3000] });
  } catch (err) {
    console.error("Error logging in:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get current user (validates session via refresh cookie)
export const getUser = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await findUserById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const safeUser = { id: user._id, username: user.username, email: user.email };
    return res.json({ user: safeUser, roles: [2000, 3000] });
  } catch (err) {
    console.error("Error getting the user:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Rotate refresh cookie
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, payload) => {
      if (err) return res.status(403).json({ message: "Forbidden, invalid refresh token." });

      const rotated = jwt.sign(
        { id: payload.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );
      res.cookie("refreshToken", rotated, refreshCookieOptions); // ✅ path: "/"
      return res.status(200).json({ ok: true });
    });
  } catch (err) {
    console.error("Error refreshing token:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Logout (clear refresh cookie)
export const logoutUser = async (req, res) => {
  // Clear cookie for BOTH paths to clean up any legacy cookie scoped to /api/auth
  res.clearCookie("refreshToken", { ...refreshCookieOptions, path: "/api/auth" });
  res.clearCookie("refreshToken", { ...refreshCookieOptions, path: "/" });
  return res.status(200).json({ message: "Logged out successfully" });
};
