import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    startDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'cancelled', 'finished'],
        default: 'upcoming'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    format: {
        variant: { type: String, default: 'Standard' },
        breakLength: { type: Number, default: 5 },
        rounds: { type: Number, default: 3 }
    },
    rules: {
        eloMin:          { type: Number, default: 0 },
        eloMax:          { type: Number, default: 9999 },
        buyIn:           { type: Number, enum: [0, 1, 10, 50], default: 0 },
        maxParticipants: { type: Number, default: 16 }
    },
    trophy: {
        title:    { type: String },
        imageUrl: { type: String, default: '' }
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    matches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

export const Tournament = mongoose.model('Tournament', tournamentSchema);
