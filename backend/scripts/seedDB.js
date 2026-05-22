import { User } from "../models/User.js";
import { Match } from "../models/Match.js";
import { Tournament } from "../models/Tournament.js";

// Importing raw data from JSON
import userRawData from "./data/users.json" with { type: "json" };
import matchRawData from "./data/matches.json" with { type: "json" };
import tournamentRawData from "./data/tournaments.json" with { type: "json" };

import { connectDB, disconnectDB } from "../config/db.config.js";

await connectDB();

// Delete existing data from DB
await User.deleteMany({});
await Match.deleteMany({});
await Tournament.deleteMany({});
console.log("Database has been emptied");


// Insert users
const createdUsers = await User.insertMany(userRawData);
console.log(`Inserted ${createdUsers.length} users`);

// Finding a couple users that can be conncected to matches/tournaments
const player1 = createdUsers[0]._id;
const player2 = createdUsers[1]._id;


// Insert matches
const matchDocs = matchRawData.map(matchData => {
    return new Match({
        ...matchData,
        players: [player1, player2], // Connect match to real user IDs
        outcome: player1 // Winner set for test data purposes
    });
});
await Match.insertMany(matchDocs);
console.log("Test matches inserted");

// Insert tournaments
const tournamentDocs = tournamentRawData.map(tourneyData => {
    return new Tournament({
        ...tourneyData,
        participants: [player1, player2], // Adding users to tournament
        matches: [] // Starts without matches in this example
    });
});
await Tournament.insertMany(tournamentDocs);
console.log("Test tournaments inserted");


// Close connection
await disconnectDB();
console.log("Seeding finished");