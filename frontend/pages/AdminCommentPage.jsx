import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../src/api/apiClient';

export default function AdminCommentPage() {
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const LIMIT = 20;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await apiFetch(`/matches/comments/recent?page=${page}&limit=${LIMIT}`);
        const data = await res.json();
        setComments(data.comments || []);
        setTotal(data.total || 0);
      } catch {
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page]);

  async function handleDelete(commentId) {
    if (!confirm('Delete this comment?')) return;
    try {
      await apiFetch(`/matches/comments/${commentId}`, { method: 'DELETE' });
      setComments(c => c.filter(comment => comment._id !== commentId));
      setTotal(t => t - 1);
    } catch {
      setError('Failed to delete comment');
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <main>
      <h1>Comment administration</h1>
      <p><Link to="/admin">← Back to dashboard</Link></p>

      {error && <p className="form-error">{error}</p>}

      <section>
        {loading ? <p>Loading...</p> : (
          <>
            <p className="text-muted">{total} comments total</p>

            {comments.length === 0 ? (
              <p className="text-muted" style={{ marginTop: 12 }}>No comments found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                {comments.map(comment => (
                  <article key={comment._id} className="card"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: 'var(--text-h)', marginBottom: 6 }}>{comment.text}</p>
                      <div className="text-muted" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <span>
                          By{' '}
                          {comment.author
                            ? <Link to={`/profile/${comment.author._id}`}>{comment.author.username}</Link>
                            : 'Unknown'
                          }
                        </span>
                        {comment.match && (
                          <span>On <Link to={`/games/${comment.match}`}>match</Link></span>
                        )}
                        {comment.tournament && (
                          <span>On <Link to={`/tournaments/${comment.tournament}`}>tournament</Link></span>
                        )}
                        <span>{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <button className="btn-danger" onClick={() => handleDelete(comment._id)}>
                      Delete
                    </button>
                  </article>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</button>
                <span className="text-muted">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
