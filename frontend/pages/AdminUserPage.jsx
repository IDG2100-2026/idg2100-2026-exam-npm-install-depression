import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../src/api/apiClient';

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const LIMIT = 20;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: LIMIT });
        if (search.length >= 3) params.set('search', search);
        const res = await apiFetch(`/users?${params}`);
        const data = await res.json();
        setUsers(data.users || []);
        setTotal(data.total || 0);
      } catch {
        setActionError('Failed to load users');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, page]);

  async function ban(userId) {
    setActionError('');
    try {
      await apiFetch(`/users/${userId}/ban`, { method: 'PATCH' });
      setUsers(u => u.map(usr => usr._id === userId ? { ...usr, isBanned: true } : usr));
    } catch { setActionError('Failed to ban user'); }
  }

  async function unban(userId) {
    setActionError('');
    try {
      await apiFetch(`/users/${userId}/unban`, { method: 'PATCH' });
      setUsers(u => u.map(usr => usr._id === userId ? { ...usr, isBanned: false } : usr));
    } catch { setActionError('Failed to unban user'); }
  }

  async function makeAdmin(userId) {
    setActionError('');
    if (!confirm('Make this user an admin?')) return;
    try {
      await apiFetch(`/users/${userId}/role`, { method: 'PATCH' });
      setUsers(u => u.map(usr => usr._id === userId ? { ...usr, role: 'admin' } : usr));
    } catch { setActionError('Failed to update role'); }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <main>
      <h1>User administration</h1>
      <p><Link to="/admin">← Back to dashboard</Link></p>

      <section>
        <input
          type="text"
          placeholder="Search by username (min. 3 chars)"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </section>

      {actionError && <p className="form-error">{actionError}</p>}

      <section>
        {loading ? <p>Loading...</p> : (
          <>
            <p className="text-muted">{total} users found</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px' }}>Username</th>
                  <th style={{ padding: '8px 12px' }}>Email</th>
                  <th style={{ padding: '8px 12px' }}>Role</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                  <th style={{ padding: '8px 12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 12px' }}>
                      <Link to={`/profile/${user._id}`}>{user.username}</Link>
                    </td>
                    <td style={{ padding: '8px 12px', fontSize: 14, color: 'var(--text)' }}>
                      {user.email || '—'}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span className="badge">{user.role}</span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      {user.isBanned
                        ? <span style={{ color: '#dc2626', fontSize: 14 }}>Banned</span>
                        : <span style={{ color: '#16a34a', fontSize: 14 }}>Active</span>
                      }
                    </td>
                    <td style={{ padding: '8px 12px', display: 'flex', gap: 6 }}>
                      {user.isBanned
                        ? <button onClick={() => unban(user._id)}>Unban</button>
                        : <button className="btn-danger" onClick={() => ban(user._id)}>Ban</button>
                      }
                      {user.role !== 'admin' && (
                        <button onClick={() => makeAdmin(user._id)}>Make admin</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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
