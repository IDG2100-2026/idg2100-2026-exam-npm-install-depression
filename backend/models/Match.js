import mongoose from 'mongoose';

const playerStateSchema = new mongoose.Schema({
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username:        { type: String, required: true },
    stack:           { type: Number, default: 0 },   // in-game points remaining
    hasFolded:       { type: Boolean, default: false },
    currentRoundBet: { type: Number, default: 0 },   // what this player bet in the current round
    heldDice:        { type: [Number], default: [] }  // indices of held dice
}, { _id: false });

// Rolls are stored server-side per round so they are never sent to all clients at once
const roundRollSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dice:   { type: [Number], default: [] }
}, { _id: false });

const matchSchema = new mongoose.Schema({
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    // Rich per-player state used during active play
    playerStates: [playerStateSchema],

    // Betting state
    pot:        { type: Number, default: 0 },
    currentBet: { type: Number, default: 0 },

    // Round tracking (rounds here = in-game betting rounds, not tournament rounds)
    currentRound: { type: Number, default: 0 },
    roundPhase: {
        type: String,
        enum: ['rolling', 'betting', 'revealing', 'gameEnd'],
        default: 'rolling'
    },
    // Server-side rolls, never broadcast wholesale; each player only gets their own
    roundRolls: [roundRollSchema],

    outcome: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    category: {
        bestOf:          { type: Number, enum: [3, 5, 7], default: 3 },
        straightsAllowed:{ type: Boolean, default: true },
        // Time controls in seconds: 10 (quick), 30 (standard), 90 (classical)
        timeControl:     { type: Number, enum: [10, 30, 90], default: 30 },
        playerCount:     { type: Number, enum: [2, 3, 5], default: 2 },
        buyIn:           { type: Number, enum: [1, 10, 50], default: 1 }
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        default: null
    },
    // Which round of the tournament this match belongs to (0 = not a tournament match)
    tournamentRound: {
        type: Number,
        default: 0
    },
    isPrivate: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['waiting', 'ongoing', 'completed', 'abandoned'],
        default: 'waiting'
    }
}, { timestamps: true });

export const Match = mongoose.model('Match', matchSchema);
