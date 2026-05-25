import rateLimit from "express-rate-limit";
import { SecurityIncident } from "../models/SecurityIncident.js";

export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: async (req, res) => {
        try {
            await SecurityIncident.create({
                type: 'rate_limit_exceeded',
                ip: req.ip,
                userAgent: req.headers['user-agent'] || '',
                userId: req.user?.id || null,
                details: `${req.method} ${req.originalUrl}`
            });
        } catch (_) {
            // Non-critical — log and continue
        }
        res.status(429).json({ message: "Too many requests, please try again later" });
    }
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts, please try again later" }
});
