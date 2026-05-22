import jwt from "jsonwebtoken";
import { hashPwd, checkPwd } from "../utils/hash.js";
import { User } from "../models/User.js";
import { Match } from "../models/Match.js";

// Fetching top list based on ELO rating
export const getLeaderboard = async (req, res) => {
    try {
        // Gets all registered users
        const players = await User.find({ role: 'registered' })
            .sort({ eloRating: -1 }) // Highest rating first
            .limit(10) // Top 10
            .select('username eloRating wins totalMatches');

        // Adding winRate manually before it being sent to client
        const leaderboard = players.map(player => {
            const winRate = player.totalMatches > 0
                ? ((player.wins / player.totalMatches) * 100).toFixed(1) + "%"
                : "0%";

            return {
                username: player.username,
                elo: player.eloRating,
                wins: player.wins,
                total: player.totalMatches,
                winRate: winRate
            };
        });

        res.status(200).json(leaderboard);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 

// Fetching specific profile with last 10 matches
export const getUserProfile = async (req, res) => {
    try {
        // Finding user
        const user = await User.findById(req.params.id)
            .select('-password')
            .lean();
            
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find last 10 matches this user participated in
        const lastMatches = await Match.find({ players: id })
            .sort({ createdAt: -1 }) // Newest first
            .limit(10)
            .populate('players', 'username'); // Fetching username instead of just ID

        res.status(200).json({
            user,
            matchHistory: lastMatches
        });
    } catch (err) {
        res.status(500).json({ message: "Error with fetching profile", error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user in DB based on username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Wrong username or password "});
        }

        // Compare password from Body with hashed password in DB
        const isMatch = checkPwd(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Wrong username or password" });
        }

        if (user.isBanned) {
            return res.status(403).json({ message: "Your account has been banned" });
        }

        // Create token with info needed in middleware
        const token = jwt.sign(
            { id: user._id, role: user.role, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Sending response to client i.e. Postman
        res.status(200).json({
            message: "Logged in",
            token: token,
            user: { 
                id: user._id,
                username: user.username, 
                role: user.role,
                isAdmin: user.isAdmin 
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const register = async (req, res) => {
    try {
        const { username, email, password, age, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or e-mail is already in use" });
        }

        // Hash password before saving
        const hashedPassword = hashPwd(password);

        // Create new user with data from User model
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            age,
            role: role || 'registered'
        });

        await newUser.save();

        res.status(201).json({
            message: "User registered successfully",
            user: { username: newUser.username, email: newUser.email }
        });
    } catch (err) {
        // Mongoose will throw error if user is too young (under 18)
        res.status(500).json({ message: "Registration error", error: err.message });
    }
};

export const banUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isBanned: true },
            { new: true }
        );
        res.status(200).json({ message: "User banned successfully", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};