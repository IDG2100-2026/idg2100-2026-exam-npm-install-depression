import * as userService from "../services/userService.js";

export const register = async (req, res) => {
    try {
        const result = await userService.registerUser(req.body);
        res.status(201).json({ message: "User registered successfully", user: result });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const result = await userService.loginUser(req.body, req.ip);
        res.status(200).json({ message: "Logged in", ...result });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: "Refresh token required" });
        const result = await userService.refreshAccessToken(refreshToken, req.ip);
        res.status(200).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const logout = async (req, res) => {
    try {
        await userService.logoutUser(req.user.id);
        res.status(200).json({ message: "Logged out" });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const result = await userService.getUserProfile(
            req.params.id,
            req.user?.id,
            req.user?.role
        );
        res.status(200).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const updated = await userService.updateUserProfile(
            req.params.id,
            req.user.id,
            req.user.role,
            req.body
        );
        res.status(200).json({ message: "Profile updated", user: updated });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await userService.getLeaderboard();
        res.status(200).json(leaderboard);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const listUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        const result = await userService.listUsers({
            page: Number(page),
            limit: Number(limit),
            search
        });
        res.status(200).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const banUser = async (req, res) => {
    try {
        const result = await userService.banUser(req.params.id, true);
        res.status(200).json({ message: "User banned", user: result });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const unbanUser = async (req, res) => {
    try {
        const result = await userService.banUser(req.params.id, false);
        res.status(200).json({ message: "User unbanned", user: result });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const makeAdmin = async (req, res) => {
    try {
        const result = await userService.makeAdmin(req.params.id);
        res.status(200).json({ message: "User promoted to admin", user: result });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
