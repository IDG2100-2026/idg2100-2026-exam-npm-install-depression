import { Comment } from "../models/Comment.js";
import { Match } from "../models/Match.js";
import { Tournament } from "../models/Tournament.js";
import { getIO } from "../sockets/index.js";
import { emitNewComment } from "../sockets/commentSocket.js";

export async function addMatchComment({ text, matchId, authorId }) {
    const match = await Match.findById(matchId);
    if (!match) {
        const err = new Error("Match not found");
        err.status = 404;
        throw err;
    }

    const comment = new Comment({ text, author: authorId, match: matchId });
    await comment.save();
    await Match.findByIdAndUpdate(matchId, { $push: { comments: comment._id } });
    await comment.populate('author', 'username');
    emitNewComment(getIO(), comment.toObject());
    return comment;
}

export async function addTournamentComment(
  tournamentId,
  userId,
  text
) {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw new Error("Tournament not found");
  }

  const comment = await Comment.create({
    text,
    author: userId,
    tournament: tournamentId
  });

  tournament.comments.push(comment._id);
  await tournament.save();

  return Comment.findById(comment._id)
    .populate("author", "username");
}

export async function deleteComment(commentId, userId, userRole) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
        const err = new Error("Comment not found");
        err.status = 404;
        throw err;
    }
    if (comment.author.toString() !== userId && userRole !== 'admin') {
        const err = new Error("You do not have permission to delete this comment");
        err.status = 403;
        throw err;
    }

    // Remove reference from parent document
    if (comment.match) {
        await Match.findByIdAndUpdate(comment.match, { $pull: { comments: commentId } });
    }
    if (comment.tournament) {
        await Tournament.findByIdAndUpdate(comment.tournament, { $pull: { comments: commentId } });
    }

    await Comment.findByIdAndDelete(commentId);
}

export async function getRecentComments({ page = 1, limit = 20 }) {
    const total = await Comment.countDocuments();
    const comments = await Comment.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'username')
        .lean();
    return { comments, total, page, limit };
}
