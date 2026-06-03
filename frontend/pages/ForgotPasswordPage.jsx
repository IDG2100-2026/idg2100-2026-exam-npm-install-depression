import { useState } from 'react';
import { Link } from 'react-router-dom';

const BASE = 'http://localhost:4567/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE}/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="page-center">
        <h1>Forgot password</h1>

        {sent ? (
          <section>
            <p className="form-success" style={{ fontSize: 16 }}>
              If that email is registered, a reset link has been sent. Check your inbox.
            </p>
            <p style={{ marginTop: 16 }}>
              <Link to="/login">Back to login</Link>
            </p>
          </section>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-muted" style={{ marginBottom: 20 }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
            <p style={{ marginTop: 16 }}>
              <Link to="/login">Back to login</Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
