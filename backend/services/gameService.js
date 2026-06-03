import { Match } from "../models/Match.js";
import { User } from "../models/User.js";
import { calculateNewEloMultiplayer } from "../utils/eloCalculator.js";
import { advanceTournamentRound } from "./tournamentService.js";
import { getIO } from "../sockets/index.js";

const DICE_COUNT = 5;
const DICE_FACES = ['A', 'K', 'Q', 'J', '9', '8'];
const FACE_RANK = { '8': 1, '9': 2, 'J': 3, 'Q': 4, 'K': 5, 'A': 6 };

function rollDice() {
    return Array.from({ length: DICE_COUNT }, () =>
        DICE_FACES[Math.floor(Math.random() * DICE_FACES.length)]
    );
}

// Build the safe public state; no other players' dice or held info is included
function publicState(match) {
    return {
        _id: match._id,
        status: match.status,
        currentRound: match.currentRound,
        roundPhase: match.roundPhase,
        pot: match.pot,
        currentBet: match.currentBet,
        category: match.category,
        playerStates: match.playerStates.map(ps => ({
            userId: ps.userId,
            username: ps.username,
            stack: ps.stack,
            hasFolded: ps.hasFolded,
            currentRoundBet: ps.currentRoundBet
            // heldDice intentionally omitted, allows bluffing
        }))
    };
}

// Called when the required number of players have joined
export async function startGame(matchId) {
    const match = await Match.findById(matchId).populate('players', 'username');
    if (!match) throw Object.assign(new Error("Match not found"), { status: 404 });
    if (match.status !== 'waiting') throw Object.assign(new Error("Match already started"), { status: 400 });

    const buyIn = match.category.buyIn;

    match.playerStates = match.players.map(p => ({
        userId: p._id,
        username: p.username,
        stack: buyIn,
        hasFolded: false,
        currentRoundBet: 0,
        heldDice: []
    }));
    match.status = 'ongoing';
    match.pot = 0;
    match.currentBet = 0;
    match.currentRound = 0;
    await match.save();

    return startRound(matchId);
}

export async function startRound(matchId) {
    const match = await Match.findById(matchId);
    if (!match) throw Object.assign(new Error("Match not found"), { status: 404 });

    match.currentRound += 1;
    match.roundPhase = 'rolling';
    match.pot = 0;
    match.currentBet = 0;

    // Reset per-player round state
    match.playerStates.forEach(ps => {
        ps.hasFolded = false;
        ps.currentRoundBet = 0;
        ps.heldDice = [];
    });

    // Generate and store rolls server-side
    match.roundRolls = match.playerStates.map(ps => ({
        userId: ps.userId,
        dice: rollDice()
    }));

    await match.save();

    // Return the full match so the socket handler can send private rolls to each player
    return match;
}

export async function holdDice(matchId, userId, heldIndices) {
    const match = await Match.findById(matchId);
    if (!match) throw Object.assign(new Error("Match not found"), { status: 404 });
    if (!['rolling', 'betting'].includes(match.roundPhase)) throw Object.assign(new Error("Not in an active round phase"), { status: 400 });

    const ps = match.playerStates.find(p => p.userId.toString() === userId);
    if (!ps) throw Object.assign(new Error("Player not in match"), { status: 403 });
    if (ps.hasFolded) throw Object.assign(new Error("You have folded"), { status: 400 });

    ps.heldDice = heldIndices;
    match.markModified('playerStates');
    await match.save();

    return publicState(match);
}

export async function rerollDice(matchId, userId) {
    const match = await Match.findById(matchId);
    if (!match) throw Object.assign(new Error("Match not found"), { status: 404 });
    if (match.roundPhase !== 'rolling') throw Object.assign(new Error("Can only reroll during rolling phase"), { status: 400 });

    const ps = match.playerStates.find(p => p.userId.toString() === userId);
    if (!ps) throw Object.assign(new Error("Player not in match"), { status: 403 });
    if (ps.hasFolded) throw Object.assign(new Error("You have folded"), { status: 400 });

    const roll = match.roundRolls.find(r => r.userId.toString() === userId);
    roll.dice = roll.dice.map((face, i) =>
        ps.heldDice.includes(i) ? face: DICE_FACES[Math.floor(Math.random() * DICE_FACES.length)]
    );

    match.markModified('roundRolls');
    await match.save();

    return { dice: roll.dice, state: publicState(match) };
}

export async function placeBet(matchId, userId, amount) {
    const match = await Match.findById(matchId);
    if (!match) throw Object.assign(new Error("Match not found"), { status: 404 });
    if (!['rolling', 'betting'].includes(match.roundPhase)) throw Object.assign(new Error("Not in an active round phase"), { status: 400 });

    const ps = match.playerStates.find(p => p.userId.toString() === userId);
    if (!ps) throw Object.assign(new Error("Player not in match"), { status: 403 });
    if (ps.hasFolded) throw Object.assign(new Error("You have already folded"), { status: 400 });
    if (amount < match.currentBet) throw Object.assign(new Error("Bet must meet or exceed the current bet"), { status: 400 });
    if (amount > ps.stack) throw Object.assign(new Error("Insufficient stack"), { status: 400 });

    const extra = amount - ps.currentRoundBet;
    ps.stack -= extra;
    ps.currentRoundBet = amount;
    match.pot += extra;
    if (amount > match.currentBet) match.currentBet = amount;

    // Transition from rolling to betting on first player action
    if (match.roundPhase === 'rolling') match.roundPhase = 'betting';

    match.markModified('playerStates');
    await match.save();

    const allActed = _allPlayersActed(match);
    if (allActed) return revealRound(matchId);

    return { state: publicState(match), roundEnded: false };
}

export async function fold(matchId, userId) {
    const match = await Match.findById(matchId);
    if (!match) throw Object.assign(new Error("Match not found"), { status: 404 });

    const ps = match.playerStates.find(p => p.userId.toString() === userId);
    if (!ps) throw Object.assign(new Error("Player not in match"), { status: 403 });
    if (ps.hasFolded) throw Object.assign(new Error("Already folded"), { status: 400 });

    ps.hasFolded = true;
    // Folded chips stay in the pot; no refund
    if (match.roundPhase === 'rolling') match.roundPhase = 'betting';
    match.markModified('playerStates');
    await match.save();

    const allActed = _allPlayersActed(match);
    if (allActed) return revealRound(matchId);

    return { state: publicState(match), roundEnded: false };
}

// All active (non-folded) players have matched currentBet, or only one remains
function _allPlayersActed(match) {
    const active = match.playerStates.filter(ps => !ps.hasFolded);
    if (active.length <= 1) return true;
    return active.every(ps => ps.currentRoundBet >= match.currentBet);
}

export async function revealRound(matchId) {
    const match = await Match.findById(matchId);
    match.roundPhase = 'revealing';
    await match.save();

    // Determine round winner by best poker-dice hand among non-folded players
    const active = match.playerStates.filter(ps => !ps.hasFolded);
    const rollsMap = Object.fromEntries(
        match.roundRolls.map(r => [r.userId.toString(), r.dice])
    );

    let roundWinner = active[0];
    for (let i = 1; i < active.length; i++) {
        if (_compareHands(rollsMap[active[i].userId.toString()], rollsMap[roundWinner.userId.toString()]) > 0) {
            roundWinner = active[i];
        }
    }

    // Award pot to round winner
    const winnerState = match.playerStates.find(ps => ps.userId.toString() === roundWinner.userId.toString());
    winnerState.stack += match.pot;
    match.pot = 0;
    match.markModified('playerStates');

    const allRolls = match.roundRolls.map(r => ({ userId: r.userId, dice: r.dice }));
    const isMatchOver = match.currentRound >= match.category.bestOf
        || match.playerStates.some(ps => ps.stack <= 0);

    await match.save();

    if (isMatchOver) {
        const matchResult = await _finalizeGame(match);
        return { state: publicState(match), roundEnded: true, allRolls, roundWinnerId: roundWinner.userId, matchOver: true, matchResult };
    }

    return { state: publicState(match), roundEnded: true, allRolls, roundWinnerId: roundWinner.userId, matchOver: false };
}

async function _finalizeGame(match) {
    // Player with most stack wins
    const winner = match.playerStates.reduce((best, ps) =>
        ps.stack > best.stack ? ps : best
    );

    const players = await User.find({ _id: { $in: match.players } });
    const timeControl = match.category.timeControl ?? 30;
    const tcKey = timeControl === 10 ? 'quick' : timeControl === 30 ? 'standard' : 'classical';
    const ratings = players.map(p => p.eloRatings[tcKey]);
    const winnerIndex = players.findIndex(p => p._id.toString() === winner.userId.toString());
    const newRatings = calculateNewEloMultiplayer(ratings, winnerIndex);

    await Promise.all(players.map((p, i) => {
        p.eloRatings[tcKey] = newRatings[i];
        p.totalMatches += 1;
        const ps = match.playerStates.find(s => s.userId.toString() === p._id.toString());
        // Return in-game stack back to profile points
        p.points += ps.stack;
        if (p._id.toString() === winner.userId.toString()) p.wins += 1;
        else p.losses += 1;
        p.markModified('eloRatings');
        return p.save();
    }));

    match.outcome = winner.userId;
    match.status = 'completed';
    match.roundPhase = 'gameEnd';
    await match.save();

    // If this match was part of a tournament, check whether the round is done
    if (match.tournamentId) {
        const result = await advanceTournamentRound(match.tournamentId);
        const io = getIO();
        if (io) {
            if (result?.finished) {
                io.of('/comments').to(`tournament:${match.tournamentId}`).emit('tournament_finished', {
                    tournamentId: match.tournamentId,
                    winnerId: result.winnerId
                });
            } else if (result?.nextRound) {
                io.of('/comments').to(`tournament:${match.tournamentId}`).emit('tournament_round_started', {
                    tournamentId: match.tournamentId,
                    round: result.nextRound,
                    matches: result.matches.map(m => ({ _id: m._id, players: m.players }))
                });
            }
        }
    }

    return { winnerId: winner.userId, winnerUsername: winner.username };
}

// Naive poker-dice hand scorer: returns a numeric score for comparison
// Higher = better hand. Counts frequencies of each die face.
function _scoreHand(dice) {
    const freq = {};
    for (const d of dice) freq[d] = (freq[d] || 0) + 1;
    const counts = Object.values(freq).sort((a, b) => b - a);
    const max = counts[0];
    const second = counts[1] || 0;

    if (max === 5) return 7000000; // five of a kind
    if (max === 4) return 6000000 + _highCard(dice); // four of a kind
    if (max === 3 && second === 2) return 5000000 + _highCard(dice); // full house
    if (_isStraight(dice)) return 4000000;
    if (max === 3) return 3000000 + _highCard(dice); // three of a kind
    if (max === 2 && second === 2) return 2000000 + _highCard(dice); // two pair
    if (max === 2) return 1000000 + _highCard(dice); // one pair
    return _highCard(dice); // high card
}

function _highCard(dice) {
    return Math.max(...dice.map(d => FACE_RANK[d]));
}

function _isStraight(dice) {
    const ranks = [...new Set(dice.map(d => FACE_RANK[d]))].sort((a, b) => a - b);
    if (ranks.length !== 5) return false;
    return ranks[4] - ranks[0] === 4;
}

function _compareHands(diceA, diceB) {
    return _scoreHand(diceA) - _scoreHand(diceB);
}

// Restore state after page reload; returns public state + the requesting player's rolls
export async function getMatchState(matchId, userId) {
    const match = await Match.findById(matchId);
    if (!match) throw Object.assign(new Error("Match not found"), { status: 404 });

    const myRolls = match.roundRolls.find(r => r.userId.toString() === userId);

    return {
        state: publicState(match),
        yourDice: myRolls?.dice ?? []
    };
}
