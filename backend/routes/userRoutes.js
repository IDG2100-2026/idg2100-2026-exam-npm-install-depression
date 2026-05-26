import express from "express";
import {
    register, login, refresh, logout,
    getUserProfile, updateUserProfile,
    getLeaderboard, listUsers,
    banUser, unbanUser, makeAdmin
} from "../controllers/userController.js";
import { verifyToken, verifyTokenOptional, isAdmin } from "../middleware/authMiddleware.js";
import { registerRules, loginRules, updateProfileRules } from "../validators/authValidators.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

// Auth
router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.post("/refresh", refresh);
router.post("/logout", verifyToken, logout);

// Leaderboard — public
router.get("/leaderboard", getLeaderboard);

// Profile — optional auth so email is hidden from strangers
router.get("/:id", verifyTokenOptional, getUserProfile);
router.patch("/:id", verifyToken, updateProfileRules, validate, updateUserProfile);

// Admin — user management
router.get("/", verifyToken, isAdmin, listUsers);
router.patch("/:id/ban", verifyToken, isAdmin, banUser);
router.patch("/:id/unban", verifyToken, isAdmin, unbanUser);
router.patch("/:id/role", verifyToken, isAdmin, makeAdmin);

export default router;
