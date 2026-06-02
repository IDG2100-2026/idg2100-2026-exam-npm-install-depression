import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../src/api/apiClient';

export default function AdminDashPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch('/stats/admin');
        const data = await res.json();
        setStats(data);
      } catch {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="form-error">{error}</p>;

  const { platformActivity, newUsersLastWeek, securityIncidents } = stats;

  return (
    <main>
      <h1>Admin Dashboard</h1>

      {/* Admin page links */}
      <section>
        <h2>Admin pages</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/admin/users"><button>User administration</button></Link>
          <Link to="/admin/comments"><button>Comment administration</button></Link>
          <Link to="/admin/tournaments"><button>Tournament creation</button></Link>
        </div>
      </section>

      {/* Platform activity */}
      <section>
        <h2>Platform activity</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div className="card" style={{ minWidth: 150, textAlign: 'center' }}>
            <p className="text-muted">Games played (7 days)</p>
            <strong style={{ fontSize: 28 }}>{platformActivity.gamesPlayedLastWeek}</strong>
          </div>
          <div className="card" style={{ minWidth: 150, textAlign: 'center' }}>
            <p className="text-muted">Available games</p>
            <strong style={{ fontSize: 28 }}>{platformActivity.availableGames}</strong>
          </div>
          <div className="card" style={{ minWidth: 150, textAlign: 'center' }}>
            <p className="text-muted">Active players (7 days)</p>
            <strong style={{ fontSize: 28 }}>{platformActivity.activePlayersLastWeek}</strong>
          </div>
          <div className="card" style={{ minWidth: 150, textAlign: 'center' }}>
            <p className="text-muted">New users (7 days)</p>
            <strong style={{ fontSize: 28 }}>{newUsersLastWeek}</strong>
          </div>
        </div>
      </section>

      {/* Rate limit incidents */}
      <section>
        <h2>Rate limit incidents</h2>
        <p className="text-muted">Users exceeding 100 requests/min</p>
        {securityIncidents.rateLimitExceeded.length === 0 ? (
          <p className="text-muted" style={{ marginTop: 12 }}>No incidents recorded.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>IP</th>
                <th style={{ padding: '8px 12px' }}>User agent</th>
                <th style={{ padding: '8px 12px' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {securityIncidents.rateLimitExceeded.map((inc, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 13 }}>{inc.ip}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text)' }}>{inc.userAgent}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text)' }}>
                    {new Date(inc.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* IP mismatch incidents */}
      <section>
        <h2>IP mismatch incidents</h2>
        <p className="text-muted">Users whose IP changed between token issue and request</p>
        {securityIncidents.ipMismatch.length === 0 ? (
          <p className="text-muted" style={{ marginTop: 12 }}>No incidents recorded.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>User</th>
                <th style={{ padding: '8px 12px' }}>IP</th>
                <th style={{ padding: '8px 12px' }}>User agent</th>
                <th style={{ padding: '8px 12px' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {securityIncidents.ipMismatch.map((inc, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 12px', fontSize: 13 }}>
                    {inc.userId
                      ? <Link to={`/profile/${inc.userId._id}`}>{inc.userId.username}</Link>
                      : <span className="text-muted">Unknown</span>
                    }
                  </td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 13 }}>{inc.ip}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text)' }}>{inc.userAgent}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text)' }}>
                    {new Date(inc.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
