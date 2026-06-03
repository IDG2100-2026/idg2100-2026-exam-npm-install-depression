import express from "express";
import {
    createMatch, getAllMatches, getMatchById, getTopMatches,
    joinMatch, leaveMatch, finalizeMatch, deleteMatch, getMatchState
} from "../controllers/matchController.js";
import { addMatchComment, deleteComment, getRecentComments } from "../controllers/commentController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { createMatchRules, paginationRules } from "../validators/matchValidators.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();


router.get("/", paginationRules, validate, getAllMatches);
router.get("/top", getTopMatches);
router.get("/:id", getMatchById);


router.post("/", createMatchRules, verifyToken, validate, createMatch);
router.post("/:id/players", verifyToken, joinMatch);          // join
router.delete("/:id/players/me", verifyToken, leaveMatch);    // leave
router.patch("/:id/outcome", verifyToken, isAdmin, finalizeMatch);


router.get("/comments/recent", verifyToken, isAdmin, getRecentComments);
router.post("/:matchId/comments", verifyToken, addMatchComment);
router.delete("/comments/:commentId", verifyToken, deleteComment);


router.get("/:id/state", verifyToken, getMatchState);


router.delete("/:id", verifyToken, isAdmin, deleteMatch);

export default router;
