import express from "express";
import { platformActivity, adminDashboard } from "../controllers/statsController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public — homepage platform activity widget
router.get("/", platformActivity);

// Admin only — full dashboard with security incidents
router.get("/admin", verifyToken, isAdmin, adminDashboard);

export default router;
