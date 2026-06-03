import 'dotenv/config';
import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import { Server as SocketServer } from "socket.io";

import { connectDB } from "./config/db.config.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import tournamentRoutes from "./routes/tournamentRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import { scheduleWeeklyPoints } from "./services/pointsService.js";

import jwt from "jsonwebtoken";
import { setIO } from "./sockets/index.js";
import { registerMatchSocket } from "./sockets/matchSocket.js";
import { registerCommentSocket } from "./sockets/commentSocket.js";
import { registerGameSocket } from "./sockets/gameSocket.js";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.BACKEND_APP_PORT || process.env.PORT || 4567;

// Socket.io; allow same origin as CORS
const io = new SocketServer(httpServer, {
    cors: { origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", methods: ["GET", "POST"] }
});

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Rate limit all /api routes
app.use("/api", apiLimiter);

app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/stats", statsRoutes);
app.use("/uploads", express.static("uploads"));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

// Authenticate socket connections via the access token passed as a handshake query
io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("Authentication required"));
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.data.userId = decoded.id;
        socket.data.role   = decoded.role;
        next();
    } catch {
        next(new Error("Invalid token"));
    }
});

// Make io accessible to services without circular imports
setIO(io);
registerMatchSocket(io);
registerCommentSocket(io);
registerGameSocket(io);

async function startServer() {
    try {
        await connectDB();
        httpServer.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
            scheduleWeeklyPoints();
        });
    } catch (err) {
        console.error("Could not start server:", err.message);
        process.exit(1);
    }
}

startServer();
