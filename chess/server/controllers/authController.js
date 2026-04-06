// controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config, { refreshCookieOptions } from "../config/appConfig.js";
import {
  findUserById,
  findUserByEmail,
  findUserByUsername,
  insertUser,
} from "../models/userModel.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[A-Za-z0-9_-]{3,32}$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

const buildSafeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email ?? null,
});

const extractRoles = (user) => {
  if (Array.isArray(user.roles)) {
    return user.roles;
  }

  if (user.role !== undefined && user.role !== null) {
    return [user.role];
  }

  return [];
};

const signRefreshToken = (userId) =>
  jwt.sign({ id: String(userId) }, config.jwtRefreshSecret, {
    expiresIn: Math.floor(config.refreshTokenTTLms / 1000),
  });

const readRefreshToken = (req) => req.cookies?.[config.refreshCookieName];

const clearRefreshCookie = (res) => {
  res.clearCookie(config.refreshCookieName, { ...refreshCookieOptions, path: "/api/auth" });
  res.clearCookie(config.refreshCookieName, { ...refreshCookieOptions, path: "/" });
};

const resolveSessionUser = async (req) => {
  const token = readRefreshToken(req);
  if (!token) {
    return { status: 401, error: "Unauthorized" };
  }

  try {
    const decoded = jwt.verify(token, config.jwtRefreshSecret);
    const user = await findUserById(decoded.id);

    if (!user) {
      return { status: 404, error: "User not found" };
    }

    if (user.banned) {
      return { status: 403, error: "Account is disabled" };
    }

    return { user };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { status: 401, error: "Session expired" };
    }

    return { status: 403, error: "Invalid refresh token" };
  }
};

const normalizeRegistrationPayload = (body = {}) => ({
  username: typeof body.username === "string" ? body.username.trim() : "",
  email: typeof body.email === "string" ? body.email.trim().toLowerCase() : "",
  password: typeof body.password === "string" ? body.password : "",
});

// Register User
export const registerUser = async (req, res) => {
  try {
    const { username, password, email } = normalizeRegistrationPayload(req.body);

    if (!username || !password || !email) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required." });
    }

    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({ error: "Username must be 3-32 characters and contain only letters, numbers, underscores, or hyphens." });
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    if (!PASSWORD_RE.test(password)) {
      return res.status(400).json({ error: "Password must be 8-72 characters and include uppercase, lowercase, and a number." });
    }

    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);
    const result = await insertUser({
      username,
      email,
      password: passwordHash,
      roles: [2000],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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
    const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const user = await findUserByUsername(username);
    if (!user) return res.status(401).json({ error: "Invalid username or password" });
    if (user.banned) return res.status(403).json({ error: "Account is disabled" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid username or password" });

    const refreshToken = signRefreshToken(user._id);

    res.cookie(config.refreshCookieName, refreshToken, refreshCookieOptions);

    return res.json({ user: buildSafeUser(user), roles: extractRoles(user) });
  } catch (err) {
    console.error("Error logging in:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get current user (validates session via refresh cookie)
export const getUser = async (req, res) => {
  try {
    const session = await resolveSessionUser(req);
    if (!session.user) {
      return res.status(session.status).json({ error: session.error });
    }

    return res.json({ user: buildSafeUser(session.user), roles: extractRoles(session.user) });
  } catch (err) {
    console.error("Error getting the user:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Rotate refresh cookie
export const refreshToken = async (req, res) => {
  try {
    const session = await resolveSessionUser(req);
    if (!session.user) {
      clearRefreshCookie(res);
      return res.status(session.status).json({ message: session.error });
    }

    const rotated = signRefreshToken(session.user._id);
    res.cookie(config.refreshCookieName, rotated, refreshCookieOptions);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error refreshing token:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Logout (clear refresh cookie)
export const logoutUser = async (req, res) => {
  clearRefreshCookie(res);
  return res.status(200).json({ message: "Logged out successfully" });
};
