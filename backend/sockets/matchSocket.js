import * as matchService from "../services/matchService.js";

// Each match gets its own room: "match:<matchId>"
// Events emitted to the room:
//   player_joined   — { userId }
//   player_left     — { userId }
//   match_finalized — { winnerId, match }

export function registerMatchSocket(io) {
    const matchNs = io.of("/matches");

    matchNs.on("connection", (socket) => {
        // Client sends { matchId } to watch or play a specific match
        socket.on("join_room", ({ matchId }) => {
            if (matchId) socket.join(`match:${matchId}`);
        });

        socket.on("leave_room", ({ matchId }) => {
            if (matchId) socket.leave(`match:${matchId}`);
        });

        // Player joins a match, triggered by the REST POST /:id/players success,
        // but can also be emitted here for real-time UI updates
        socket.on("player_joined", ({ matchId, userId }) => {
            matchNs.to(`match:${matchId}`).emit("player_joined", { userId });
        });

        socket.on("player_left", ({ matchId, userId }) => {
            matchNs.to(`match:${matchId}`).emit("player_left", { userId });
        });
    });
}

// Called from matchService after finalizeMatch to broadcast the result
export function emitMatchFinalized(io, matchId, data) {
    io.of("/matches").to(`match:${matchId}`).emit("match_finalized", data);
}
