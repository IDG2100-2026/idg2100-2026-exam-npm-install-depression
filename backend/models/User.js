import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        immutable: true // Username can't be changed after creation
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 18 // Minimum 18 years old requirement
    },
    role: {
        type: String,
        enum: ['anonymous', 'registered', 'admin'],
        default: 'registered'
    },
    eloRating: {
        type: Number,
        default: 1000 // Standard value, automatically updated
    },
    eloChangeLastWeek: {
        type: Number,
        default: 0
    },
    wins: {
        type: Number,
        default: 0
    },
    totalMatches: {
        type: Number,
        default: 0
    },
    trophies: [{
        tournamentTitle: String,
        trophyTitle: String,
        imageUrl: String,
        wonAt: { type: Date, default: Date.now }
    }],
    isBanned: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);