import * as matchService from "../services/matchService.js";


export function registerMatchSocket(io) {
    const matchNs = io.of("/matches");

    matchNs.on("connection", (socket) => {

        socket.on("join_room", ({ matchId }) => {
            if (matchId) socket.join(`match:${matchId}`);
        });

        socket.on("leave_room", ({ matchId }) => {
            if (matchId) socket.leave(`match:${matchId}`);
        });


        socket.on("player_joined", ({ matchId, userId }) => {
            matchNs.to(`match:${matchId}`).emit("player_joined", { userId });
        });

        socket.on("player_left", ({ matchId, userId }) => {
            matchNs.to(`match:${matchId}`).emit("player_left", { userId });
        });
    });
}


export function emitMatchFinalized(io, matchId, data) {
    io.of("/matches").to(`match:${matchId}`).emit("match_finalized", data);
}
