import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
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
    rolls: [[Number]],
    holds: [[Number]],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        default: null
    },
    isPrivate: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['waiting', 'playing', 'completed', 'abandoned'],
        default: 'waiting'
    }
}, { timestamps: true });

export const Match = mongoose.model('Match', matchSchema);
