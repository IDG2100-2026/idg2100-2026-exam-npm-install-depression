import { User } from "../models/User.js";

const WEEKLY_POINTS = 100;
const ONE_WEEK_MS   = 7 * 24 * 60 * 60 * 1000;


export async function distributeWeeklyPoints() {
    const result = await User.updateMany(
        { role: 'registered', isBanned: false },
        { $inc: { points: WEEKLY_POINTS } }
    );
    console.log(`[points] Distributed ${WEEKLY_POINTS} points to ${result.modifiedCount} users`);
    return result.modifiedCount;
}


export function scheduleWeeklyPoints() {
    distributeWeeklyPoints().catch(err =>
        console.error('[points] Initial distribution failed:', err.message)
    );

    setInterval(() => {
        distributeWeeklyPoints().catch(err =>
            console.error('[points] Weekly distribution failed:', err.message)
        );
    }, ONE_WEEK_MS);

    console.log(`[points] Weekly points scheduled (every ${ONE_WEEK_MS / 1000 / 60 / 60 / 24} days)`);
}
