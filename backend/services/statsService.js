import { User } from "../models/User.js";
import { Match } from "../models/Match.js";
import { SecurityIncident } from "../models/SecurityIncident.js";

function oneWeekAgo() {
    return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

function oneMonthAgo() {
    return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
}


export async function getPlatformActivity() {
    const since = oneWeekAgo();

    const [gamesPlayedLastWeek, availableGames, activePlayers] = await Promise.all([
        Match.countDocuments({ status: 'completed', updatedAt: { $gte: since } }),
        Match.countDocuments({ status: 'waiting' }),
        Match.distinct('players', { updatedAt: { $gte: since } })
    ]);

    return {
        gamesPlayedLastWeek,
        availableGames,
        activePlayersLastWeek: activePlayers.length
    };
}


export async function getAdminDashboard() {
    const since = oneWeekAgo();

    const [
        platformActivity,
        newUsersLastWeek,
        rateLimitIncidents,
        ipMismatchIncidents
    ] = await Promise.all([
        getPlatformActivity(),
        User.countDocuments({ createdAt: { $gte: since } }),
        SecurityIncident.find({ type: 'rate_limit_exceeded' })
            .sort({ createdAt: -1 })
            .limit(50)
            .select('ip userAgent createdAt details')
            .lean(),
        SecurityIncident.find({ type: 'ip_mismatch' })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('userId', 'username')
            .select('ip userAgent userId createdAt details')
            .lean()
    ]);

    return {
        platformActivity,
        newUsersLastWeek,
        securityIncidents: {
            rateLimitExceeded: rateLimitIncidents,
            ipMismatch: ipMismatchIncidents
        }
    };
}
