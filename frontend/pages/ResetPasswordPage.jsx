import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const BASE = 'http://localhost:4567/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <main>
        <div className="page-center">
          <h1>Reset password</h1>
          <p className="form-error">Invalid or missing reset link.</p>
          <Link to="/forgot-password">Request a new one</Link>
        </div>
      </main>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE}/users/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      navigate('/login', { state: { message: 'Password reset successfully — please log in.' } });
    } catch (err) {
      setError(err.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="page-center">
        <h1>Reset password</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 chars, one uppercase, one digit"
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm new password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat password"
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      </div>
    </main>
  );
}
