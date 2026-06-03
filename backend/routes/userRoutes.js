import express from "express";
import {
    register, login, refresh, logout,
    verifyEmail, resendVerification, forgotPassword, resetPassword,
    getUserProfile, updateUserProfile, getCurrentUser,
    getLeaderboard, listUsersPublic, listUsers,
    banUser, unbanUser, makeAdmin
} from "../controllers/userController.js";
import { verifyToken, verifyTokenOptional, isAdmin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { registerRules, loginRules, updateProfileRules, resetPasswordRules } from "../validators/authValidators.js";
import { validate } from "../middleware/validate.js";
import { User } from "../models/User.js";

const router = express.Router();


router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.post("/refresh", refresh);
router.post("/logout", verifyToken, logout);


router.get("/verify/:token", verifyEmail);
router.post("/resend-verification", resendVerification);


router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPasswordRules, validate, resetPassword);


router.get("/leaderboard", getLeaderboard);


router.get("/directory", listUsersPublic);


router.get("/me", verifyToken, getCurrentUser);
router.get("/:id", verifyTokenOptional, getUserProfile);
router.patch("/:id", verifyToken, upload.single('profileImage'), updateProfileRules, validate, updateUserProfile);


router.get("/", listUsers);
router.patch("/:id/ban", verifyToken, isAdmin, banUser);
router.patch("/:id/unban", verifyToken, isAdmin, unbanUser);
router.patch("/:id/role", verifyToken, isAdmin, makeAdmin);

export default router;
