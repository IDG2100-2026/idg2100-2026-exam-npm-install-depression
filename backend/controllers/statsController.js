import { getPlatformActivity, getAdminDashboard } from "../services/statsService.js";

export const platformActivity = async (req, res) => {
    try {
        const stats = await getPlatformActivity();
        res.status(200).json(stats);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

export const adminDashboard = async (req, res) => {
    try {
        const dashboard = await getAdminDashboard();
        res.status(200).json(dashboard);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
