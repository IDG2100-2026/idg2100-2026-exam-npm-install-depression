import * as commentService from "../services/commentService.js";

export const addMatchComment = async (req, res) => {
    try {
        const comment = await commentService.addMatchComment({
            text: req.body.text,
            matchId: req.params.matchId,
            authorId: req.user.id
        });
        res.status(201).json({ message: "Comment added", comment });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const addTournamentComment = async (req, res) => {
    try {
        const comment = await commentService.addTournamentComment({
            text: req.body.text,
            tournamentId: req.params.tournamentId,
            authorId: req.user.id
        });
        res.status(201).json({ message: "Comment added", comment });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const deleteComment = async (req, res) => {
    try {
        await commentService.deleteComment(req.params.commentId, req.user.id, req.user.role);
        res.status(200).json({ message: "Comment deleted" });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const getRecentComments = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const result = await commentService.getRecentComments({
            page: Number(page),
            limit: Number(limit)
        });
        res.status(200).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
