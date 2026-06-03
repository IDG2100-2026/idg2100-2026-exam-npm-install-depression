import express from "express";
import {
    getAllTournaments, getUpcomingTournaments, getTournamentById,
    createTournament, updateTournament, deleteTournament,
    joinTournament, leaveTournament, startTournament
} from "../controllers/tournamentController.js";
import { addTournamentComment, deleteComment } from "../controllers/commentController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
    createTournamentRules, updateTournamentRules, tournamentQueryRules
} from "../validators/tournamentValidators.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();


router.get("/", tournamentQueryRules, validate, getAllTournaments);
router.get("/upcoming", getUpcomingTournaments);
router.get("/:id", getTournamentById);


router.post("/", verifyToken, isAdmin, upload.single('image'), createTournamentRules, validate, createTournament);
router.patch("/:id", verifyToken, isAdmin, updateTournamentRules, validate, updateTournament);
router.delete("/:id", verifyToken, isAdmin, deleteTournament);
router.patch("/:id/status", verifyToken, isAdmin, startTournament); 


router.post("/:id/participants", verifyToken, joinTournament);
router.delete("/:id/participants/me", verifyToken, leaveTournament);


router.post("/:tournamentId/comments", verifyToken, addTournamentComment);
router.delete("/comments/:commentId", verifyToken, deleteComment);

export default router;
