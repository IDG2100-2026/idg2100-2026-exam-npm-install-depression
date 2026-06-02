import { useState } from "react";

function CommentSection({ matchId, comments = [], onCommentAdded }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!text.trim()) return;

    try {
      const res = await fetch(`/api/games/${matchId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ text })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not post comment");
      }

      onCommentAdded(data.comment);
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
          comments.map(comment => (
            <article className="comment" key={comment._id}>
              <strong>
                {comment.author?.username || "Anonymous"}
              </strong>

              <p>{comment.text}</p>
            </article>
          ))
        )}
      </div>

      <form className="comment-section__form" onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
        />

        {error && <p className="comment-section__error">{error}</p>}

        <button type="submit">Post comment</button>
      </form>
    </section>
  );
}

export default CommentSection;