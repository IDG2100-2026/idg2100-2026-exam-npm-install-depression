import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        immutable: true
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
        min: 18
    },
    role: {
        type: String,
        enum: ['registered', 'admin'],
        default: 'registered'
    },
    profileImage: {
        type: String,
        default: ''
    },
    aboutMe: {
        type: String,
        default: '',
        maxLength: 500
    },
    points: {
        type: Number,
        default: 100
    },
    // Elo per time control (10s / 30s / 90s)
    eloRatings: {
        quick:    { type: Number, default: 1000 },
        standard: { type: Number, default: 1000 },
        classical:{ type: Number, default: 1000 }
    },
    wins: {
        type: Number,
        default: 0
    },
    losses: {
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
    },
    // Refresh token stored server-side for invalidation on logout
    refreshToken: {
        type: String,
        default: null
    },
    // Email verification
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        default: null
    },
    verificationTokenExpiry: {
        type: Date,
        default: null
    },
    // Password reset
    passwordResetToken: {
        type: String,
        default: null
    },
    passwordResetTokenExpiry: {
        type: Date,
        default: null
    }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
