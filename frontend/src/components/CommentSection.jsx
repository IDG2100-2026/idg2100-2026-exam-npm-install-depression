import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./CommentSection.css";

function CommentSection({
  entityType,
  entityId,
  comments = [],
  onCommentAdded,
  addComment,
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!entityId) return;

    const token = localStorage.getItem("accessToken");

    const socket = io("http://localhost:4567/comments", {
      auth: {
        token,
      },
    });

    socket.emit("join_comments", { entityType, entityId });

    // socket.on("new_comment", (comment) => {
    //   onCommentAdded(comment);
    // });
    socket.on("new_comment", (comment) => {
          console.log("NEW COMMENT SOCKET", comment);
          onCommentAdded(comment);
        });

    return () => {
      socket.emit("leave_comments", { entityType, entityId });
      socket.disconnect();
    };
  }, [entityType, entityId, onCommentAdded]);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");

//     if (!text.trim()) return;

//     try {
//       await addComment(entityId, text);
//       setText("");
//     } catch (err) {
//       setError(err.message);
//     }
//   }

async function handleSubmit(e) {
  e.preventDefault();
  setError("");

  if (!text.trim()) return;

//   const token = localStorage.getItem("accessToken");

//   if (!token) {
//     setError("You need to log in to comment.");
//     return;
//   }

//   try {
//     await addComment(entityId, text);
//     setText("");
//   } catch (err) {
//     setError(err.message);
//   }

//   try {
//   const newComment = await addComment(entityId, text);

//   onCommentAdded(newComment);

//   setText("");
// } catch (err) {
//   setError(err.message);
// }
// }

try {
  const response = await addComment(entityId, text);
    console.log("ADD COMMENT RESPONSE:", response);
  onCommentAdded(response.comment);

  setText("");
} catch (err) {
  setError(err.message);
}
}

  return (
    <section className="comment-section">
      <h2>Comments</h2>

      <div className="comment-section__list">
        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <article className="comment" key={comment._id}>
              <strong>{comment.author?.username || "Anonymous"}</strong>
              <p>{comment.text}</p>
            </article>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          maxLength={500}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
        />

        {error && <p>{error}</p>}

        <button type="submit">Post comment</button>
      </form>
    </section>
  );
}

export default CommentSection;