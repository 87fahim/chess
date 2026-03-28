// routes/auth.js
import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  getUser,
  refreshToken,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Frontend expects these:
router.get("/me", getUser);
router.post("/refresh", refreshToken);

router.post("/logout", logoutUser);

export default router;
