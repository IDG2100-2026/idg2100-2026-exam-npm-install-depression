import jwt from "jsonwebtoken";
import { SecurityIncident } from "../models/SecurityIncident.js";

export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No access, missing token" });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.ip && decoded.ip !== req.ip) {
            await SecurityIncident.create({
                type: 'ip_mismatch',
                ip: req.ip,
                userAgent: req.headers['user-agent'] || '',
                userId: decoded.id,
                details: `Token issued for IP ${decoded.ip}, request from ${req.ip}`
            }).catch(() => {}); 
            return res.status(401).json({ message: "Token IP mismatch — please log in again" });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};


export const verifyTokenOptional = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }
    const token = authHeader.split(' ')[1];
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        req.user = null;
    }
    next();
};

export const isAdmin = (req, res, next) => {
    if (req.user?.role === 'admin') return next();
    res.status(403).json({ message: "Admin access required" });
};
