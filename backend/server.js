import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.config.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import tournamentRoutes from "./routes/tournamentRoutes.js";

const app = express();
const PORT = process.env.BACKEND_APP_PORT || process.env.PORT || 4567;

app.use(express.json());
app.use(cors());

// Using user routes with prefix /api/users
app.use("/api/users", userRoutes);

// Match route
app.use("/api/matches", matchRoutes);

// Tournament route
app.use("/api/tournaments", tournamentRoutes);

// Uploads
app.use("/uploads", express.static('uploads'));

// Start sequence waiting for DB
async function startServer() {
    try {
        await connectDB();
        
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });
    } catch (err) {
        console.error("Could not start server due to DB error:", err.message);
        process.exit(1); // This will stop process completely if faulty
    }
}

startServer();
