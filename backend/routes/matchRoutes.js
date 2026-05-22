import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import express from "express";
const router = express.Router();
import { createMatch, joinMatch, updateMatch, getMatchById, getTopEloMatches, getAllMatches, getCategoryLeaderboard, deleteMatch } from "../controllers/matchController.js";
import { addComment, deleteComment } from "../controllers/commentController.js";

// Accessable to everyone
router.get("/", getAllMatches);
router.get("/top-elo", getTopEloMatches);
router.get("/category", getCategoryLeaderboard);

// Only logged in users can register/join match or comment
router.post("/register", verifyToken, createMatch);
router.put("/:id/join", verifyToken, joinMatch);
router.put("/:id", verifyToken, updateMatch);
router.get("/:id", verifyToken, getMatchById);
router.post("/:matchId/comments", verifyToken, addComment);
router.delete("/comments/:commentId", verifyToken, deleteComment); // Deleting specific comment

// Only admin can delete match
router.delete("/:id", verifyToken, isAdmin, deleteMatch); // For admin deletion of matches



export default router;