import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const BASE = 'http://localhost:4567/api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState(''); // '' | 'sending' | 'sent' | 'error'

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the link. Please check your email and try again.');
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`${BASE}/users/verify/${token}`);
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully — you can now log in.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. The link may have expired.');
        }
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    }

    verify();
  }, [token]);

  async function handleResend(e) {
    e.preventDefault();
    setResendStatus('sending');
    try {
      const res = await fetch(`${BASE}/users/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail })
      });
      const data = await res.json();
      setResendStatus('sent');
      setMessage(data.message || 'A new verification link has been sent.');
    } catch {
      setResendStatus('error');
    }
  }

  return (
    <main>
      <div className="page-center">
        <h1>Email verification</h1>

        {status === 'loading' && <p className="text-muted">Verifying your email...</p>}

        {status === 'success' && (
          <section>
            <p className="form-success" style={{ fontSize: 16 }}>{message}</p>
            <Link to="/login">
              <button className="btn-primary" style={{ marginTop: 16 }}>Go to login</button>
            </Link>
          </section>
        )}

        {status === 'error' && (
          <section>
            <p className="form-error" style={{ fontSize: 16 }}>{message}</p>

            <div style={{ marginTop: 24 }}>
              <h2>Resend verification email</h2>
              <p className="text-muted">Enter your email address and we'll send a new link.</p>

              {resendStatus === 'sent' ? (
                <p className="form-success" style={{ marginTop: 12 }}>
                  If that email is registered and unverified, a new link has been sent. Check your inbox.
                </p>
              ) : (
                <form onSubmit={handleResend} style={{ marginTop: 12 }}>
                  <div className="form-group">
                    <label>Email address</label>
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={e => setResendEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  {resendStatus === 'error' && (
                    <p className="form-error">Failed to send. Please try again.</p>
                  )}
                  <button type="submit" className="btn-primary" disabled={resendStatus === 'sending'}>
                    {resendStatus === 'sending' ? 'Sending...' : 'Resend verification email'}
                  </button>
                </form>
              )}
            </div>

            <p style={{ marginTop: 20 }}>
              <Link to="/login">Back to login</Link>
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
