import express from "express";
import { createUser, deleteUser, getUser, updateUser, loginUser, getUserProfile, updateUserProfile } from "../controllers/user.controller2.js";
import { protect } from "../middleware/authMiddleware.js"; // Import auth middleware

const router = express.Router();

router.get("/:id", protect, getUser); // Fetch user by _id (Admin only)
router.post("/register", createUser);
router.post("/login", loginUser);

// ✅ User Profile Routes
router.get("/profile/me", protect, getUserProfile); // Fetch logged-in user's profile
router.put("/profile/update", protect, updateUserProfile); // Update profile

router.put("/:id", protect, updateUser); // Update user (Admin)
router.delete("/:id", protect, deleteUser); // Delete user (Admin)

export default router;