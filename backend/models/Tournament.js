import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    format: {
        variant: { type: String, default: 'Spanish Poker' },
        breakLength: { type: Number, default: 5 }, // Pause between rounds
        minRounds: { type: Number },
        maxRounds: { type: Number }
    },
    trophy: {
        title: { type: String },
        imageUrl: { type: String } // Saves path to img
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    matches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match'
    }],
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

export const Tournament = mongoose.model('Tournament', tournamentSchema);