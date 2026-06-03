import mongoose from 'mongoose';

const playerStateSchema = new mongoose.Schema({
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username:        { type: String, required: true },
    stack:           { type: Number, default: 0 },   
    hasFolded:       { type: Boolean, default: false },
    currentRoundBet: { type: Number, default: 0 },   
    heldDice:        { type: [Number], default: [] }  
}, { _id: false });

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
    playerStates: [playerStateSchema],

    pot:        { type: Number, default: 0 },
    currentBet: { type: Number, default: 0 },

    currentRound: { type: Number, default: 0 },
    roundPhase: {
        type: String,
        enum: ['rolling', 'betting', 'revealing', 'gameEnd'],
        default: 'rolling'
    },
    roundRolls: [roundRollSchema],

    outcome: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    category: {
        bestOf:          { type: Number, enum: [3, 5, 7], default: 3 },
        straightsAllowed:{ type: Boolean, default: true },
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
