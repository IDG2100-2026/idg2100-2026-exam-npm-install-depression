import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    outcome: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Referencing winner
    },
    category: {
        bestOf: { type: Number, enum: [3, 5, 7], default: 3 },
        straightsAllowed: { type: Boolean, default: true },
        timeControl: { type: Number, default: 5 } // in minutes
    },
    rolls: [[Number]], //Matrix for saving all die rolls
    holds: [[Number]], // The dice being held
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    isPrivate: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['waiting', 'playing', 'completed', 'abandoned'],
        default: 'waiting'
    }
}, { timestamps: true });

export const Match = mongoose.model('Match', matchSchema);