// Source: db.config.js from idg2100.backend.lt

import mongoose from "mongoose";

const { DB_HOSTNAME, DB_PORT, DB_NAME, NODE_ENV } = process.env;

const CONNECTION_URI = `mongodb://${DB_HOSTNAME}:${DB_PORT}/${DB_NAME}`;

export async function connectDB() {
    if(DB_HOSTNAME && DB_PORT && DB_NAME) {
        mongoose.connection.on("error", err => {
            console.error("Unhandled connection error:", err);
        });
        console.log("Connecting to MongoDB now...");
        return mongoose.connect(
            CONNECTION_URI,
            {
                appName: DB_NAME + "-" + NODE_ENV,
                maxPoolSize: 50
            }
        );
    }
    throw new Error(`Missing env variables neede to connect to MongoDB: ${DB_HOSTNAME}, ${DB_NAME}, ${DB_PORT}`);

}

export async function disconnectDB() {
    return mongoose.disconnect();
}

