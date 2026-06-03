import express from "express";
import { platformActivity, adminDashboard } from "../controllers/statsController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/", platformActivity);


router.get("/admin", verifyToken, isAdmin, adminDashboard);

export default router;
