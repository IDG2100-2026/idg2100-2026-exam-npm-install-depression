import * as matchService from "../services/matchService.js";
import * as gameService from "../services/gameService.js";

export const createMatch = async (req, res) => {
    try {
        const match = await matchService.createMatch({
            userId: req.user.id,
            category: req.body.category
        });
        res.status(201).json({ message: "Match created", match });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const getAllMatches = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, timeControl, buyIn, straightsAllowed } = req.query;
        const result = await matchService.getAllMatches({
            page: Number(page),
            limit: Number(limit),
            status,
            timeControl,
            buyIn,
            straightsAllowed
        });
        // Pagination metadata in headers; body is the plain array the frontend expects
        res.set('X-Total-Count', result.total);
        res.set('X-Page', result.page);
        res.set('X-Limit', result.limit);
        res.set('Access-Control-Expose-Headers', 'X-Total-Count, X-Page, X-Limit');
        res.status(200).json(result.matches);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const getMatchById = async (req, res) => {
    try {
        const match = await matchService.getMatchById(req.params.id);
        res.status(200).json(match);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const getTopMatches = async (req, res) => {
    try {
        const matches = await matchService.getTopMatches();
        res.status(200).json(matches);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const joinMatch = async (req, res) => {
    try {
        const match = await matchService.joinMatch(req.params.id, req.user.id);
        res.status(200).json({ message: "Joined match", match });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const leaveMatch = async (req, res) => {
    try {
        const match = await matchService.leaveMatch(req.params.id, req.user.id);
        res.status(200).json({ message: "Left match", match });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const finalizeMatch = async (req, res) => {
    try {
        const { winnerId } = req.body;
        if (!winnerId) return res.status(400).json({ message: "winnerId is required" });
        const match = await matchService.finalizeMatch(req.params.id, winnerId);
        res.status(200).json({ message: "Match finalized", match });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const getMatchState = async (req, res) => {
    try {
        const result = await gameService.getMatchState(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const deleteMatch = async (req, res) => {
    try {
        await matchService.deleteMatch(req.params.id);
        res.status(200).json({ message: "Match deleted" });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
