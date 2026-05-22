import { Match } from "../models/Match.js";
import { Tournament } from "../models/Tournament.js";
import { finalizeTournament } from "./tournamentController.js";
import { User } from "../models/User.js";
import { calculateNewElo } from "../utils/eloCalculator.js";


export const createMatch = async (req, res) => {
    try {
        const { player1, category } = req.body;

        if (!player1) {
            return res.status(404).json({ message: "Host player (player1) is required" });
        }
        
        // Save match 
        const newMatch = new Match({
            players: [player1],
            status: 'waiting',
            category: category,
            date: new Date()
        });
        await newMatch.save();

        res.status(201).json({
            message: "Match created in lobby",
            match: newMatch
        });
    } catch (err) {
        res.status(500).json({ message: "Error creating match", error: err.message });
    }
};


export const getAllMatches = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 0;
        const matches = await Match.find()
            .sort({ createdAt: -1})
            .limit(limit)
            .populate('players', 'username')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username' }
            });
        res.status(200).json(matches);
    } catch (err) {
        res.status(500).json({ message: "Could not get matches", error: err.message });
    }
};


export const getMatchById = async (req, res) => {
    try {
        const { id } = req.params;

        const match = await Match.findById(id)
            .populate('players', 'username eloRating')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username' } 
            });

        if (!match) {
            return res.status(404).json({ message: "Match not found in DB" });
        }

        res.status(200).json(match);
    } catch (err) {
        res.status(500).json({ message: "Server error with getting match" });
    }
};


export const getTopEloMatches = async (req, res) => {
    try {
        const matches = await Match.find()
            .populate('players', 'username eloRating')
            .lean(); // Turns obj to normal JS obj for quicker processing

        const sortedMatches = matches
            .map(match => {
                const elos = match.players.map(p => p.eloRating || 1200);

                const averageElo = elos.length > 0
                    ? elos.reduce((a, b) => a + b, 0) / elos.length
                    : 1200;

                return {
                    ...match, averageElo: Math.round(averageElo)
                };
            })
            .sort((a, b) => b.averageElo - a.averageElo)
            .slice(0, 5);

        res.status(200).json(sortedMatches);
    } catch (err) {
        res.status(500).json({
            message: "Error with manual sorting of Top ELO matches",
            error: err.message
        });
    }
}


// Get top list for a specific game type
export const getCategoryLeaderboard = async (req, res) => {
    try {
        const { bestOf, timeControl } = req.query;

        // Filter matches that will match category and populate winner/outcome
        const matches = await Match.find({
            "category.bestOf": Number(bestOf),
            "category.timeControl": Number(timeControl)
        })
        .populate('outcome', 'username eloRating')
        .sort({ createdAt: -1 });

        res.status(200).json(matches);
    } catch (err) {
        res.status(500).json({ message: "Could not get category list", error: err.message });
    }
};


export const joinMatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const match = await Match.findById(id);

        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }

        // Check if match is full
        if (match.players.length >= 2) {
            return res.status(400).json({ message: "Match is full" });
        }

        if (!match.players.includes(userId)) {
            // Adding 2nd player and setting status to 'playing'
            match.players.push(userId);
            if (match.players.length === 2) {
                match.status = 'playing';
                await match.save();
            }
        }
        res.status(200).json({ message: "You have joined this match", match });
    } catch (err) {
        res.status(500).json({ message: "Could not connect to match", error: err.message });
    }
};


export const updateMatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { winnerId, player2 } = req.body;

        const match = await Match.findById(id);
        if (!match) return res.status(404).json({ message: "Match not found "});

        // Logic for when player 2 joins match
        if (player2 && match.players.length === 1) {
            match.players.push(player2);
            match.status = 'playing';
        }

        // Logic for finished match and calculate ELO
        if (winnerId) {
            const p1 = await User.findById(match.players[0]);
            const p2 = await User.findById(match.players[1]);

            const scoreA = winnerId === p1._id.toString() ? 1 : 0;

            const { newRatingA, newRatingB } = calculateNewElo(
                p1.eloRating,
                p2.eloRating,
                scoreA
            );

            // Update users in DB with new calculted values
            p1.eloRating = newRatingA;
            p2.eloRating = newRatingB;

            p1.totalMatches += 1;
            p2.totalMatches += 1;
            winnerId === p1._id.toString() ? p1.wins += 1 : p2.wins += 1;

            await Promise.all([
                p1.save(),
                p2.save()
            ]);

            match.outcome = winnerId;
            match.status = 'completed';
            match.eloAtTime = [newRatingA, newRatingB];
        }

        await match.save();
        res.status(200).json({ message: "Match updated", match });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Admin function for deleting match
export const deleteMatch = async (req, res) => {
    try {
        const deletedMatch = await Match.findByIdAndDelete(req.params.id);
        if (!deletedMatch) {
            return res.status(404).json({ message: "Match not found" });
        }
        res.status(200).json({ message: "Match deleted by admin" });
    } catch (err) {
        res.status(500).json({ message: "Could not delete match", error: err.message });
    }
};

