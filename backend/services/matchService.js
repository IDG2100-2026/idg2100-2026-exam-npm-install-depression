import { Match } from "../models/Match.js";
import { User } from "../models/User.js";
import { calculateNewEloMultiplayer } from "../utils/eloCalculator.js";
import { getIO } from "../sockets/index.js";
import { broadcastGameStart } from "../sockets/gameSocket.js";

export async function createMatch({ userId, category }) {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error("Player not found");
        err.status = 404;
        throw err;
    }

    const buyIn = category?.buyIn ?? 1;
    if (user.points < buyIn) {
        const err = new Error("Insufficient points for buy-in");
        err.status = 400;
        throw err;
    }

    const match = new Match({
        players: [userId],
        status: 'waiting',
        category
    });
    await match.save();
    return match;
}

export async function getAllMatches({ page = 1, limit = 20, status, timeControl, buyIn, straightsAllowed }) {
    const filter = {};
    if (status) filter.status = status;
    if (timeControl) filter['category.timeControl'] = Number(timeControl);
    if (buyIn) filter['category.buyIn'] = Number(buyIn);
    if (straightsAllowed !== undefined) filter['category.straightsAllowed'] = straightsAllowed === 'true';

    const total = await Match.countDocuments(filter);
    const matches = await Match.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('players', 'username eloRatings')
        .populate({ path: 'comments', populate: { path: 'author', select: 'username' } })
        .lean();

    return { matches, total, page, limit };
}

export async function getMatchById(id) {
    const match = await Match.findById(id)
        .populate('players', 'username eloRatings')
        .populate('outcome', 'username')
        .populate({ path: 'comments', populate: { path: 'author', select: 'username' } });

    if (!match) {
        const err = new Error("Match not found");
        err.status = 404;
        throw err;
    }
    return match;
}

export async function joinMatch(matchId, userId) {

    const match = await Match.findById(matchId);
    if (!match) {
        const err = new Error("Match not found");
        err.status = 404;
        throw err;
    }
    if (match.status !== 'waiting') {
        const err = new Error("Match is not open for joining");
        err.status = 400;
        throw err;
    }

    const maxPlayers = match.category.playerCount ?? 2;
    if (match.players.length >= maxPlayers) {
        const err = new Error("Match is full");
        err.status = 400;
        throw err;
    }
    if (match.players.map(p => p.toString()).includes(userId)) {
        const err = new Error("You have already joined this match");
        err.status = 400;
        throw err;
    }

    const user = await User.findById(userId);
    if (!user || user.points < match.category.buyIn) {
        const err = new Error("Insufficient points for buy-in");
        err.status = 400;
        throw err;
    }

    match.players.push(userId);
    await match.save();
    
    if (match.players.length >= maxPlayers) {
        const io = getIO();
        await broadcastGameStart(io, match._id);
    }
    
    return match;

}

export async function leaveMatch(matchId, userId) {
    const match = await Match.findById(matchId);
    if (!match) {
        const err = new Error("Match not found");
        err.status = 404;
        throw err;
    }
    if (match.status !== 'waiting') {
        const err = new Error("Cannot leave a match that has already started");
        err.status = 400;
        throw err;
    }

    match.players = match.players.filter(p => p.toString() !== userId);

    if (match.players.length === 0) {
        match.status = 'abandoned';
    }
    await match.save();
    return match;
}

export async function finalizeMatch(matchId, winnerId) {
    const match = await Match.findById(matchId);
    if (!match) {
        const err = new Error("Match not found");
        err.status = 404;
        throw err;
    }
    if (match.status !== 'ongoing') {
        const err = new Error("Match is not in progress");
        err.status = 400;
        throw err;
    }

    const players = await User.find({ _id: { $in: match.players } });
    const timeControl = match.category.timeControl ?? 30;
    const tcKey = timeControl === 10 ? 'quick' : timeControl === 30 ? 'standard' : 'classical';

    const ratings = players.map(p => p.eloRatings[tcKey]);
    const winnerIndex = players.findIndex(p => p._id.toString() === winnerId);
    const newRatings = calculateNewEloMultiplayer(ratings, winnerIndex);

    await Promise.all(players.map((p, i) => {
        p.eloRatings[tcKey] = newRatings[i];
        p.totalMatches += 1;
        if (p._id.toString() === winnerId) {
            p.wins += 1;
            p.points += match.category.buyIn * (players.length - 1);
        } else {
            p.losses += 1;
            p.points = Math.max(0, p.points - match.category.buyIn);
        }
        p.markModified('eloRatings');
        return p.save();
    }));

    match.outcome = winnerId;
    match.status = 'completed';
    match.roundPhase = 'gameEnd';
    await match.save();
    return match;
}

export async function deleteMatch(matchId) {
    const match = await Match.findByIdAndDelete(matchId);
    if (!match) {
        const err = new Error("Match not found");
        err.status = 404;
        throw err;
    }
}

export async function getTopMatches() {
    const matches = await Match.find({ status: 'waiting' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('players', 'username eloRatings')
        .lean();
    return matches;
}
