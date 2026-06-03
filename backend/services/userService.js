import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Match } from "../models/Match.js";
import { hashPwd, checkPwd } from "../utils/hash.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/mailer.js";

const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function generateAccessToken(user, ip) {
    return jwt.sign(
        { id: user._id, role: user.role, ip },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
}

function generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
}

export async function registerUser({ username, email, password, age }) {
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
        const err = new Error("Username or email is already in use");
        err.status = 409;
        throw err;
    }

    const hashedPassword = await hashPwd(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = new User({
        username, email, password: hashedPassword, age,
        verificationToken,
        verificationTokenExpiry: new Date(Date.now() + TOKEN_EXPIRY_MS)
    });
    await user.save();

    try {
        await sendVerificationEmail(email, verificationToken);
    } catch (mailErr) {
        console.warn('Verification email failed to send:', mailErr.message);
    }

    return { username: user.username, email: user.email };
}

export async function loginUser({ username, password }, ip) {
    const user = await User.findOne({ username });
    if (!user) {
        const err = new Error("Wrong username or password");
        err.status = 401;
        throw err;
    }

    const isMatch = await checkPwd(password, user.password);
    if (!isMatch) {
        const err = new Error("Wrong username or password");
        err.status = 401;
        throw err;
    }

    if (user.isBanned) {
        const err = new Error("Your account has been banned");
        err.status = 403;
        throw err;
    }

    const accessToken = generateAccessToken(user, ip);
    const refreshToken = generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return {
        accessToken,
        refreshToken,
        user: { id: user._id, username: user.username, role: user.role }
    };
}

export async function refreshAccessToken(refreshToken, ip) {
    const user = await User.findOne({ refreshToken });
    if (!user) {
        const err = new Error("Invalid refresh token");
        err.status = 401;
        throw err;
    }

    const accessToken = generateAccessToken(user, ip);
    return { accessToken };
}

export async function logoutUser(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
}

export async function getUserById(id) {
    const user = await User.findById(id).select('-password -refreshToken -verificationToken').lean();
    if (!user) {
        const err = new Error("User not found");
        err.status = 404;
        throw err;
    }
    return user;
}

export async function getUserProfile(id, requesterId, requesterRole) {
    const user = await User.findById(id)
        .select('-password -refreshToken -verificationToken')
        .lean();

    if (!user) {
        const err = new Error("User not found");
        err.status = 404;
        throw err;
    }

    // Only the user themselves or an admin can see the email
    const isOwnerOrAdmin = requesterId === id || requesterRole === 'admin';
    if (!isOwnerOrAdmin) {
        delete user.email;
    }

    const page = 1;
    const limit = 10;
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [matchHistory, totalMatches, winsLastMonth, lossesLastMonth] = await Promise.all([
        Match.find({ players: id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('players', 'username')
            .populate('outcome', 'username')
            .lean(),
        Match.countDocuments({ players: id }),
        Match.countDocuments({ outcome: id, createdAt: { $gte: oneMonthAgo } }),
        Match.countDocuments({
            players: id,
            outcome: { $ne: id, $exists: true },
            createdAt: { $gte: oneMonthAgo }
        })
    ]);

    return { user, matchHistory, totalMatches, page, limit, winsLastMonth, lossesLastMonth };
}

export async function updateUserProfile(id, requesterId, requesterRole, updates) {
    if (id !== requesterId && requesterRole !== 'admin') {
        const err = new Error("Forbidden");
        err.status = 403;
        throw err;
    }

    const allowed = ['email', 'aboutMe', 'profileImage', 'age'];
    const sanitized = {};
    for (const key of allowed) {
        if (updates[key] !== undefined) sanitized[key] = updates[key];
    }

    if (updates.password) {
        sanitized.password = await hashPwd(updates.password);
    }

    const updated = await User.findByIdAndUpdate(id, sanitized, { new: true, runValidators: true })
        .select('-password -refreshToken -verificationToken');

    if (!updated) {
        const err = new Error("User not found");
        err.status = 404;
        throw err;
    }
    return updated;
}

export async function getLeaderboard() {
    const players = await User.find({ role: 'registered', isBanned: false })
        .sort({ 'eloRatings.standard': -1 })
        .limit(10)
        .select('username eloRatings wins totalMatches');

    return players.map(p => ({
        username: p.username,
        elo: p.eloRatings,
        wins: p.wins,
        totalMatches: p.totalMatches,
        winRate: p.totalMatches > 0
            ? ((p.wins / p.totalMatches) * 100).toFixed(1) + '%'
            : '0%'
    }));
}

export async function banUser(targetId, isBanned) {
    const user = await User.findById(targetId);
    if (!user) {
        const err = new Error("User not found");
        err.status = 404;
        throw err;
    }
    user.isBanned = isBanned;
    await user.save();
    return { id: user._id, username: user.username, isBanned: user.isBanned };
}

export async function makeAdmin(targetId) {
    const user = await User.findById(targetId);
    if (!user) {
        const err = new Error("User not found");
        err.status = 404;
        throw err;
    }
    user.role = 'admin';
    await user.save();
    return { id: user._id, username: user.username, role: user.role };
}

export async function verifyEmail(token) {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
        const err = new Error("Invalid verification link");
        err.status = 400;
        throw err;
    }
    if (user.verificationTokenExpiry < new Date()) {
        const err = new Error("Verification link has expired — please request a new one");
        err.status = 400;
        throw err;
    }
    user.isEmailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();
}

export async function resendVerification(email) {
    const user = await User.findOne({ email });
    // Always respond the same way to avoid leaking whether the email exists
    if (!user || user.isEmailVerified) return;

    const token = crypto.randomBytes(32).toString('hex');
    user.verificationToken = token;
    user.verificationTokenExpiry = new Date(Date.now() + TOKEN_EXPIRY_MS);
    await user.save();
    await sendVerificationEmail(email, token);
}

export async function forgotPassword(email) {
    const user = await User.findOne({ email });
    // Always respond the same way to avoid leaking whether the email exists
    if (!user) return;

    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = token;
    user.passwordResetTokenExpiry = new Date(Date.now() + TOKEN_EXPIRY_MS);
    await user.save();
    await sendPasswordResetEmail(email, token);
}

export async function resetPassword(token, newPassword) {
    const user = await User.findOne({ passwordResetToken: token });
    if (!user) {
        const err = new Error("Invalid or expired reset link");
        err.status = 400;
        throw err;
    }
    if (user.passwordResetTokenExpiry < new Date()) {
        const err = new Error("Reset link has expired — please request a new one");
        err.status = 400;
        throw err;
    }
    user.password = await hashPwd(newPassword);
    user.passwordResetToken = null;
    user.passwordResetTokenExpiry = null;
    // Invalidate any active refresh tokens so old sessions must re-login
    user.refreshToken = null;
    await user.save();
}

// Slim public list, used by frontend dev user-picker; no sensitive fields
export async function listUsersPublic() {
    return User.find({ isBanned: false })
        .select('_id username points')
        .sort({ username: 1 })
        .lean();
}

export async function listUsers({ page = 1, limit = 20, search = '' }) {
    const query = search
        ? { username: { $regex: search, $options: 'i' } }
        : {};
    const total = await User.countDocuments(query);
    const users = await User.find(query)
        .select('-password -refreshToken -verificationToken')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    return { users, total, page, limit };
}

export async function getCurrentUser(userId) {
    const user = await User.findById(userId)
        .select("-password -refreshToken -verificationToken")
        .lean();

    if (!user) {
        const err = new Error("User not found");
        err.status = 404;
        throw err;
    }

    return user;
}