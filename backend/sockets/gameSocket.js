import { Match } from "../models/Match.js";
import * as gameService from "../services/gameService.js";


export function registerGameSocket(io) {
    const ns = io.of("/game");

    ns.on("connection", (socket) => {

        socket.on("join_match", async ({ matchId }) => {
            if (!matchId) return;
            const userId = socket.data.userId;

            socket.join(`match:${matchId}`);

            try {
                const { state, yourDice } = await gameService.getMatchState(matchId, userId);
                socket.emit("game_state", { state });
                if (yourDice.length) socket.emit("your_dice", { dice: yourDice });
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        socket.on("hold_dice", async ({ matchId, held }) => {
            try {
                const userId = socket.data.userId;
                const state = await gameService.holdDice(matchId, userId, held);

                ns.to(`match:${matchId}`).emit("game_state", { state });
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        socket.on("reroll", async ({ matchId }) => {
            try {
                const userId = socket.data.userId;
                const result = await gameService.rerollDice(matchId, userId);

                socket.emit("your_dice", { dice: result.dice });

                ns.to(`match:${matchId}`).emit("game_state", { state: result.state });
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        socket.on("place_bet", async ({ matchId, amount }) => {
            try {
                const userId = socket.data.userId;
                const result = await gameService.placeBet(matchId, userId, amount);

                if (result.matchOver) {
                    ns.to(`match:${matchId}`).emit("round_revealed", {
                        allRolls: result.allRolls,
                        roundWinnerId: result.roundWinnerId,
                        state: result.state
                    });
                    ns.to(`match:${matchId}`).emit("game_over", { matchResult: result.matchResult, state: result.state });
                } else if (result.roundEnded) {
                    ns.to(`match:${matchId}`).emit("round_revealed", {
                        allRolls: result.allRolls,
                        roundWinnerId: result.roundWinnerId,
                        state: result.state
                    });

                    setTimeout(() => _broadcastNextRound(ns, matchId), 3000);
                } else {
                    ns.to(`match:${matchId}`).emit("game_state", { state: result.state });
                }
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        socket.on("fold", async ({ matchId }) => {
            try {
                const userId = socket.data.userId;
                const result = await gameService.fold(matchId, userId);

                if (result.matchOver) {
                    ns.to(`match:${matchId}`).emit("round_revealed", {
                        allRolls: result.allRolls,
                        roundWinnerId: result.roundWinnerId,
                        state: result.state
                    });
                    ns.to(`match:${matchId}`).emit("game_over", { matchResult: result.matchResult, state: result.state });
                } else if (result.roundEnded) {
                    ns.to(`match:${matchId}`).emit("round_revealed", {
                        allRolls: result.allRolls,
                        roundWinnerId: result.roundWinnerId,
                        state: result.state
                    });
                    setTimeout(() => _broadcastNextRound(ns, matchId), 3000);
                } else {
                    ns.to(`match:${matchId}`).emit("game_state", { state: result.state });
                }
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });
    });
}

async function _broadcastNextRound(ns, matchId) {
    try {
        const match = await gameService.startRound(matchId);


        const publicUpdate = {
            _id: match._id,
            currentRound: match.currentRound,
            roundPhase: match.roundPhase,
            pot: match.pot,
            currentBet: match.currentBet,
            playerStates: match.playerStates.map(ps => ({
                userId: ps.userId,
                username: ps.username,
                stack: ps.stack,
                hasFolded: ps.hasFolded,
                currentRoundBet: ps.currentRoundBet
            }))
        };
        ns.to(`match:${matchId}`).emit("round_started", { state: publicUpdate });


        const sockets = await ns.in(`match:${matchId}`).fetchSockets();
        for (const s of sockets) {
            const roll = match.roundRolls.find(r => r.userId.toString() === s.data.userId);
            if (roll) s.emit("your_dice", { dice: roll.dice });
        }

        const timeControl = match.category.timeControl * 1000; 
        setTimeout(() => _enforceTimer(ns, matchId), timeControl);
    } catch (err) {
        ns.to(`match:${matchId}`).emit("error", { message: "Failed to start next round" });
    }
}

async function _enforceTimer(ns, matchId) {
    const match = await Match.findById(matchId);

    if (!match || match.roundPhase !== 'rolling' && match.roundPhase !== 'betting') return;


    for (const ps of match.playerStates) {
        if (!ps.hasFolded && ps.currentRoundBet < match.currentBet) {
            const extra = Math.min(match.currentBet - ps.currentRoundBet, ps.stack);
            ps.stack -= extra;
            ps.currentRoundBet += extra;
            match.pot += extra;
        }
    }
    match.markModified('playerStates');
    await match.save();


    const result = await gameService.revealRound(matchId);
    ns.to(`match:${matchId}`).emit("round_revealed", {
        allRolls: result.allRolls,
        roundWinnerId: result.roundWinnerId,
        state: result.state
    });
    if (result.matchOver) {
        ns.to(`match:${matchId}`).emit("game_over", { matchResult: result.matchResult, state: result.state });
    } else {
        setTimeout(() => _broadcastNextRound(ns, matchId), 3000);
    }
}

export async function broadcastGameStart(io, matchId) {
    const ns = io.of("/game");
    try {
        const match = await gameService.startGame(matchId);
        const sockets = await ns.in(`match:${matchId}`).fetchSockets();

        const publicUpdate = {
            _id: match._id,
            status: match.status,
            currentRound: match.currentRound,
            roundPhase: match.roundPhase,
            pot: match.pot,
            currentBet: match.currentBet,
            playerStates: match.playerStates.map(ps => ({
                userId: ps.userId,
                username: ps.username,
                stack: ps.stack,
                hasFolded: false,
                currentRoundBet: 0
            }))
        };

        ns.to(`match:${matchId}`).emit("game_started", { state: publicUpdate });


        for (const s of sockets) {
            const roll = match.roundRolls.find(r => r.userId.toString() === s.data.userId);
            if (roll) s.emit("your_dice", { dice: roll.dice });
        }

        const timeControl = match.category.timeControl * 1000;
        setTimeout(() => _enforceTimer(ns, matchId), timeControl);
    } catch (err) {
        ns.to(`match:${matchId}`).emit("error", { message: "Failed to start game" });
    }
}
