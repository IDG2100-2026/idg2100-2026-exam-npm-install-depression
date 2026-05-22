import express from "express";
import { getAllTournaments, createTournament, startTournament, joinTournament } from "../controllers/tournamentController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getAllTournaments);

router.post("/", verifyToken, isAdmin, upload.single('image'), createTournament);

// Only logged in admins can start tournaments
router.post("/:id/start", verifyToken, isAdmin, startTournament);

// Route to join a tournament
router.post("/:id/join", verifyToken, joinTournament);

export default router;