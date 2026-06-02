import * as gameService from "../services/gameService.js";
import * as matchService from "../services/matchService.js";

// Namespace: /game
// Room naming: "match:<matchId>"
//
// Client → Server events:
//   join_match   { matchId }            — enter the room, receive state + own dice on reconnect
//   hold_dice    { matchId, held }      — held = array of dice indices e.g. [0, 2, 4]
//   place_bet    { matchId, amount }    — bet/match/raise
//   fold         { matchId }            — fold this round
//
// Server → Client events:
//   game_state       { state }          — broadcast to room (no dice inside)
//   your_dice        { dice }           — private, sent only to the acting player
//   round_revealed   { allRolls, roundWinnerId, state }   — broadcast when round ends
//   game_over        { matchResult, state }               — broadcast when match ends
//   error            { message }        — sent only to the socket that caused it

export function registerGameSocket(io) {
    const ns = io.of("/game");

    ns.on("connection", (socket) => {

        socket.on("join_match", async ({ matchId }) => {
            if (!matchId) return;
            const userId = socket.data.userId;

            socket.join(`match:${matchId}`);

            // Restore state for the reconnecting player
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
                // Only tell others that this player has chosen dice (count only, no values)
                ns.to(`match:${matchId}`).emit("game_state", { state });
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        socket.on("reroll", async ({ matchId }) => {
            try {
                const userId = socket.data.userId;
                const result = await gameService.rerollDice(matchId, userId);
                // Send new dice to this player only
                socket.emit("your_dice", { dice: result.dice });
                // Broadcast updated public state to room (no dice values)
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
                    // Start next round after a brief pause for UI to show results
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

        // Broadcast public state first (no dice)
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

        // Send each player their own dice privately via their socket
        const sockets = await ns.in(`match:${matchId}`).fetchSockets();
        for (const s of sockets) {
            const roll = match.roundRolls.find(r => r.userId.toString() === s.data.userId);
            if (roll) s.emit("your_dice", { dice: roll.dice });
        }
    } catch (err) {
        ns.to(`match:${matchId}`).emit("error", { message: "Failed to start next round" });
    }
}

// Called from matchService when the last player joins and the game can start
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

        // Deliver private rolls
        for (const s of sockets) {
            const roll = match.roundRolls.find(r => r.userId.toString() === s.data.userId);
            if (roll) s.emit("your_dice", { dice: roll.dice });
        }
    } catch (err) {
        ns.to(`match:${matchId}`).emit("error", { message: "Failed to start game" });
    }
}
