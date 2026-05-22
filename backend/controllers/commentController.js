import { Comment } from "../models/Comment.js";
import { Match } from "../models/Match.js";

export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const { matchId } = req.params;
        const authorId = req.user.id; // Fetched from JWT via verifyToken

        const newComment = new Comment({
            text,
            author: authorId,
            match: matchId
        });
        // Save comment to DB
        await newComment.save();

        // Add comment to match
        await Match.findByIdAndUpdate(matchId, {
            $push: { comments: newComment._id }
        });

        res.status(201).json({ message: "Comment added", comment: newComment });
    } catch (err) {
        res.status(500).json({ message: "Could not save comment", error: err.message });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id; // ID from JWT token
        const userRole = req.user.role; // Role from token

        // Finding comment to know what match it belongs to
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found "});
        }

        // Check if user either owns comment or if user is admin
        if (comment.author.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({
                message: "You do not have permission to delete this comment"
            });
        }

        // Remove reference from Match model
        await Match.findByIdAndUpdate(comment.match, {
            $pull: { comments: commentId }
        });

        // Delete comment
        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({ message: "Comment has been deleted" });
    } catch (err) {
        res.status(500).json({ message: "Could not delete", error: err.message });
    }
};