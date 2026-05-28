import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, "Comment cannot be empty"],
        trim: true,
        maxLength: 1000
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // A comment belongs to either a match or a tournament, not both
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        default: null
    },
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        default: null
    }
}, { timestamps: true });

commentSchema.pre('validate', async function () {
    if (!this.match && !this.tournament) {
        throw new Error('A comment must belong to a match or a tournament');
    }
});

export const Comment = mongoose.model('Comment', commentSchema);
