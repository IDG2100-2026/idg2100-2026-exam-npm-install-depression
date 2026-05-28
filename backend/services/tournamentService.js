import { Tournament } from "../models/Tournament.js";
import { Match } from "../models/Match.js";
import { User } from "../models/User.js";

export async function getAllTournaments({ page = 1, limit = 10, status, sortBy = 'startDate', order = 'asc', search = '' }) {
    const filter = {};
    if (status) filter.status = status;
    if (search && search.length >= 3) {
        filter.title = { $regex: search, $options: 'i' };
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const allowedSorts = ['startDate', 'title', 'createdAt'];
    const sortField = allowedSorts.includes(sortBy) ? sortBy : 'startDate';

    const total = await Tournament.countDocuments(filter);
    const tournaments = await Tournament.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'username')
        .populate('winner', 'username')
        .lean();

    return { tournaments, total, page, limit };
}

export async function getUpcomingTournaments() {
    return Tournament.find({ status: 'upcoming' })
        .sort({ startDate: 1 })
        .limit(5)
        .populate('author', 'username')
        .select('title startDate format rules participants')
        .lean();
}

export async function getTournamentById(id) {
    const tournament = await Tournament.findById(id)
        .populate('author', 'username')
        .populate('participants', 'username eloRatings')
        .populate('winner', 'username')
        .populate({ path: 'comments', populate: { path: 'author', select: 'username' } })
        .populate({ path: 'matches', populate: { path: 'players', select: 'username' } });

    if (!tournament) {
        const err = new Error("Tournament not found");
        err.status = 404;
        throw err;
    }
    return tournament;
}

export async function createTournament({ title, description, startDate, format, rules, trophy, authorId }) {
    const tournament = new Tournament({
        title,
        description,
        startDate,
        format,
        rules,
        trophy: { title: trophy?.title || `${title} Trophy`, imageUrl: trophy?.imageUrl || '' },
        author: authorId,
        status: 'upcoming'
    });
    await tournament.save();
    return tournament;
}

export async function updateTournament(id, updates, requesterId, requesterRole) {
    const tournament = await Tournament.findById(id);
    if (!tournament) {
        const err = new Error("Tournament not found");
        err.status = 404;
        throw err;
    }
    if (requesterRole !== 'admin') {
        const err = new Error("Admin access required");
        err.status = 403;
        throw err;
    }
    if (tournament.status === 'ongoing' || tournament.status === 'finished') {
        const err = new Error("Cannot edit a tournament that is ongoing or finished");
        err.status = 400;
        throw err;
    }

    const allowed = ['title', 'description', 'startDate', 'format', 'rules', 'trophy', 'status'];
    for (const key of allowed) {
        if (updates[key] !== undefined) tournament[key] = updates[key];
    }
    await tournament.save();
    return tournament;
}

export async function deleteTournament(id, requesterRole) {
    if (requesterRole !== 'admin') {
        const err = new Error("Admin access required");
        err.status = 403;
        throw err;
    }
    const tournament = await Tournament.findByIdAndDelete(id);
    if (!tournament) {
        const err = new Error("Tournament not found");
        err.status = 404;
        throw err;
    }
}

export async function joinTournament(tournamentId, userId) {
    const caller = await User.findById(userId).select('isEmailVerified');
    if (!caller?.isEmailVerified) {
        const err = new Error("You must verify your email before joining a tournament");
        err.status = 403;
        throw err;
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
        const err = new Error("Tournament not found");
        err.status = 404;
        throw err;
    }
    if (tournament.status !== 'upcoming') {
        const err = new Error("Tournament has already started or is closed");
        err.status = 400;
        throw err;
    }
    if (tournament.participants.map(p => p.toString()).includes(userId)) {
        const err = new Error("You have already joined this tournament");
        err.status = 400;
        throw err;
    }
    if (tournament.participants.length >= tournament.rules.maxParticipants) {
        const err = new Error("Tournament is full");
        err.status = 400;
        throw err;
    }

    // Check buy-in
    if (tournament.rules.buyIn > 0) {
        const user = await User.findById(userId);
        if (!user || user.points < tournament.rules.buyIn) {
            const err = new Error("Insufficient points for buy-in");
            err.status = 400;
            throw err;
        }
    }

    tournament.participants.push(userId);
    await tournament.save();
    return { participants: tournament.participants.length };
}

export async function leaveTournament(tournamentId, userId) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
        const err = new Error("Tournament not found");
        err.status = 404;
        throw err;
    }
    if (!tournament.participants.map(p => p.toString()).includes(userId)) {
        const err = new Error("You are not in this tournament");
        err.status = 400;
        throw err;
    }

    tournament.participants = tournament.participants.filter(p => p.toString() !== userId);
    await tournament.save();
    return { participants: tournament.participants.length };
}

export async function startTournament(tournamentId) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
        const err = new Error("Tournament not found");
        err.status = 404;
        throw err;
    }
    if (tournament.status !== 'upcoming') {
        const err = new Error("Tournament cannot be started");
        err.status = 400;
        throw err;
    }
    if (tournament.participants.length < 2) {
        const err = new Error("At least 2 players are required to start");
        err.status = 400;
        throw err;
    }

    const shuffled = [...tournament.participants].sort(() => Math.random() - 0.5);
    const round1Matches = [];

    for (let i = 0; i < shuffled.length; i += 2) {
        if (shuffled[i + 1]) {
            const match = new Match({
                players: [shuffled[i], shuffled[i + 1]],
                tournamentId: tournament._id,
                status: 'waiting'
            });
            const saved = await match.save();
            round1Matches.push(saved._id);
        }
    }

    tournament.matches = round1Matches;
    tournament.status = 'ongoing';
    await tournament.save();
    return tournament;
}

export async function finalizeTournament(tournamentId, winnerId) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
        const err = new Error("Tournament not found");
        err.status = 404;
        throw err;
    }

    tournament.winner = winnerId;
    tournament.status = 'finished';
    await tournament.save();

    await User.findByIdAndUpdate(winnerId, {
        $push: {
            trophies: {
                tournamentTitle: tournament.title,
                trophyTitle: tournament.trophy?.title || 'Tournament Trophy',
                imageUrl: tournament.trophy?.imageUrl || ''
            }
        },
        $inc: { 'eloRatings.standard': 50 }
    });
}
