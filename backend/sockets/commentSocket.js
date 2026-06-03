import * as commentService from "../services/commentService.js";


export function registerCommentSocket(io) {
    const commentNs = io.of("/comments");

    commentNs.on("connection", (socket) => {
        socket.on("join_match", ({ matchId }) => {
            if (matchId) socket.join(`match:${matchId}`);
        });

        socket.on("join_tournament", ({ tournamentId }) => {
            if (tournamentId) socket.join(`tournament:${tournamentId}`);
        });

        socket.on("leave_match", ({ matchId }) => {
            if (matchId) socket.leave(`match:${matchId}`);
        });

        socket.on("leave_tournament", ({ tournamentId }) => {
            if (tournamentId) socket.leave(`tournament:${tournamentId}`);
        });
    });
}


export function emitNewComment(io, comment) {
    const ns = io.of("/comments");
    if (comment.match) {
        ns.to(`match:${comment.match}`).emit("new_comment", comment);
    }
    if (comment.tournament) {
        ns.to(`tournament:${comment.tournament}`).emit("new_comment", comment);
    }
}
