import * as tournamentService from "../services/tournamentService.js";

export const getAllTournaments = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, sortBy, order, search } = req.query;
        const result = await tournamentService.getAllTournaments({
            page: Number(page),
            limit: Number(limit),
            status,
            sortBy,
            order,
            search
        });
        res.status(200).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const getUpcomingTournaments = async (req, res) => {
    try {
        const tournaments = await tournamentService.getUpcomingTournaments();
        res.status(200).json(tournaments);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const getTournamentById = async (req, res) => {
    try {
        const tournament = await tournamentService.getTournamentById(req.params.id);
        res.status(200).json(tournament);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const createTournament = async (req, res) => {
    try {
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
        const tournament = await tournamentService.createTournament({
            ...req.body,
            trophy: { title: req.body.trophyTitle, imageUrl },
            authorId: req.user.id
        });
        res.status(201).json(tournament);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const updateTournament = async (req, res) => {
    try {
        const updated = await tournamentService.updateTournament(
            req.params.id,
            req.body,
            req.user.id,
            req.user.role
        );
        res.status(200).json({ message: "Tournament updated", tournament: updated });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const deleteTournament = async (req, res) => {
    try {
        await tournamentService.deleteTournament(req.params.id, req.user.role);
        res.status(200).json({ message: "Tournament deleted" });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const joinTournament = async (req, res) => {
    try {
        const result = await tournamentService.joinTournament(req.params.id, req.user.id);
        res.status(200).json({ message: "Joined tournament", ...result });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const leaveTournament = async (req, res) => {
    try {
        const result = await tournamentService.leaveTournament(req.params.id, req.user.id);
        res.status(200).json({ message: "Left tournament", ...result });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const startTournament = async (req, res) => {
    try {
        const tournament = await tournamentService.startTournament(req.params.id);
        res.status(200).json({ message: "Tournament started", tournament });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
