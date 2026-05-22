import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    // Get token from Header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No access, missing token" });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Add user data in 'req' so controllers can use it
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Admin access required" });
    }
};