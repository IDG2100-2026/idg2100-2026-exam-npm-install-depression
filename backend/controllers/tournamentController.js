import { Tournament } from "../models/Tournament.js";
import { Match } from "../models/Match.js";

export const getAllTournaments = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 0;
        const tournaments = await Tournament.find()
            .sort({ date: 1 })
            .limit(limit);
        res.status(200).json(tournaments);
    } catch (err) {
        res.status(500).json({ message: "Could not get tournaments", error: err.message });
    }
};

export const createTournament = async (req, res) => {
    try {
        const { title, description, startDate, format } = req.body;

        // Get file path if an image has been uploaded
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

        const newTournament = new Tournament({
            title,
            description,
            startDate,
            format,
            // Empty arrays as default
            participants: [],
            matches: [],
            trophy: {
                title: `${title} Trophy`,
                imageUrl: imageUrl // Saves path to image in DB
            }
        });
        await newTournament.save();

        res.status(201).json(newTournament);
    } catch (err) {
        res.status(500).json({ message: "Could not create new tournament", error: err.message });
    }
};

export const joinTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        // Check if user has already joined
        if (tournament.participants.includes(req.user.id)) {
            return res.status(400).json({ message: "You have already joined this tournament" });
        }

        // Add user to participants array
        tournament.participants.push(req.user.id);
        await tournament.save();

        res.status(200).json({ message: "Joined successfully", participants: tournament.participants });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const startTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);

        if (tournament.participants.length < 2) {
            return res.status(400).json({ message: "At least 2 players are required" });
        }

        // Shuffle players randomly
        const shuffled = [...tournament.participants].sort(() => Math.random() - 0.5);

        // Create first matches in DB
        const round1Matches = [];
        for (let i = 0; i < shuffled.length; i += 2) {
            if (shuffled[i+1]) {
                const match = new Match({
                    players: [shuffled[i], shuffled[i+1]],
                    isTournamentMatch: true
                });
                const savedMatch = await match.save();
                round1Matches.push(savedMatch._id);
            }
        }

        // Update tournament with matches
        tournament.matches = round1Matches;
        await tournament.save();

        res.status(200).json({ message: "Tournament has started, rounds generated", tournament });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const finalizeTournament = async (tournamentId, winnerId) => {
    const tournament = await Tournament.findById(tournamentId);

    // Update tournament status
    tournament.winner = winnerId;
    tournament.status = "finished";
    await tournament.save();

    // Give trophy to winner in User model
    await User.findByIdAndUpdate(winnerId, {
        $push: {
            trophies: {
                tournamentTitle: tournament.title,
                trophyTitle: tournament.trophy?.title || "Tournament Trophy",
                imageUrl: tournament.trophy?.imageUrl || ""
            }
        },
        $inc: { eloRating: 50 } // Slight increase in ELO after victory
    });
};