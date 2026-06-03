import { User } from "../models/User.js";
import { Match } from "../models/Match.js";
import { Tournament } from "../models/Tournament.js";
import { Comment } from "../models/Comment.js";

import userRawData from "./data/users.json" with { type: "json" };
import matchRawData from "./data/matches.json" with { type: "json" };
import tournamentRawData from "./data/tournaments.json" with { type: "json" };

import { connectDB, disconnectDB } from "../config/db.config.js";
import { hashPwd } from "../utils/hash.js";

await connectDB();

await Comment.deleteMany({});
await Match.deleteMany({});
await Tournament.deleteMany({});
await User.deleteMany({});
console.log("Database cleared");

// Hash passwords before inserting
const userDocs = await Promise.all(
    userRawData.map(async ({ password, ...rest }) => ({
        ...rest,
        password: await hashPwd(password)
    }))
);
const createdUsers = await User.insertMany(userDocs);
console.log(`Inserted ${createdUsers.length} users`);

const admin  = createdUsers.find(u => u.role === 'admin');
const player1 = createdUsers.find(u => u.username === 'pokerqueen67');
const player2 = createdUsers.find(u => u.username === 'dicemaster99');
const player3 = createdUsers.find(u => u.username === 'rollin_thor');

// Insert matches and link to real user IDs
// const matchDocs = matchRawData.map((m, i) => new Match({
//    ...m,
//    players:
//  i === 0 ? [player1._id, player2._id] :
//  i === 1 ? [player1._id] :
//  i === 2 ? [player1._id] :
//  [player1._id, player2._id]
//}));

const matchDocs = matchRawData.map((m, i) => new Match({
    ...m,

    players:
      i === 0 ? [player1._id, player2._id] :
      i === 1 ? [player1._id] :
      i === 2 ? [player1._id] :
      [player1._id, player2._id],

    playerStates:
      m.status === "ongoing" || m.status === "completed"
        ? [
            {
              userId: player1._id,
              username: player1.username,
              stack: 1000,
              hasFolded: false,
              currentRoundBet: 0,
              heldDice: m.holds?.[0] || []
            },
            {
              userId: player2._id,
              username: player2.username,
              stack: 1000,
              hasFolded: false,
              currentRoundBet: 0,
              heldDice: m.holds?.[1] || []
            }
          ]
        : [],

    roundRolls:
      m.status === "ongoing" || m.status === "completed"
        ? [
            {
              userId: player1._id,
              dice: m.rolls?.[0] || []
            },
            {
              userId: player2._id,
              dice: m.rolls?.[1] || []
            }
          ]
        : []
}));

const createdMatches = await Match.insertMany(matchDocs);
console.log(`Inserted ${createdMatches.length} matches`);

// Insert tournaments, link author and participants
const tournamentDocs = tournamentRawData.map((t, i) => new Tournament({
    ...t,
    author: admin._id,
    participants: i === 2 ? [player1._id, player2._id, player3._id] : [player1._id, player2._id],
    winner: t.status === 'finished' ? player1._id : undefined,
    matches: t.status === 'finished' ? [createdMatches[0]._id] : []
}));
const createdTournaments = await Tournament.insertMany(tournamentDocs);
console.log(`Inserted ${createdTournaments.length} tournaments`);

// Seed a few comments
const commentDocs = [
    { text: "Great game, well played!", author: player2._id, match: createdMatches[0]._id },
    { text: "Looking forward to this tournament!", author: player1._id, tournament: createdTournaments[0]._id }
];
await Comment.insertMany(commentDocs);
console.log("Inserted sample comments");

await disconnectDB();
console.log("Seeding complete");
