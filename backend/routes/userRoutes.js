import express from "express";
import { getLeaderboard, getUserProfile, register, login, banUser } from "../controllers/userController.js";
import { isAdmin, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Defining route for leaderboard
router.get("/leaderboard", getLeaderboard);

// Route for user profile
router.get("/profile/:id", getUserProfile);

// Route for creating new user
router.post("/register", register);

// Route for login and JWT token
router.post("/login", login);

// Banning a user
router.put("/:id/ban", verifyToken, isAdmin, banUser);

export default router;