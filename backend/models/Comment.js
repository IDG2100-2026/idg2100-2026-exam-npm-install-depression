import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, "Comment cannot be empty"],
        trim: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true
    }
}, { timestamps: true });

export const Comment = mongoose.model('Comment', commentSchema);