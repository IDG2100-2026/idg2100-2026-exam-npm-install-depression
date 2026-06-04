import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile, updateProfile, getCurrentUser, isAdmin } from '../src/api/authApi';
import { apiFetch } from '../src/api/apiClient';

const BACKEND = 'http://localhost:4567';


function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND}${path}`;
}

const ELO_LABELS = {
  quick: '10s — Quick',
  standard: '30s — Standard',
  classical: '90s — Classical'
};

export default function ProfilePage() {
  const { id } = useParams();
  const currentUser = getCurrentUser();
  const isOwner = currentUser?.id === id;
  const canEdit = isOwner || isAdmin();

  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [winsLastMonth, setWinsLastMonth] = useState(0);
  const [lossesLastMonth, setLossesLastMonth] = useState(0);
  const [matchPage, setMatchPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ email: '', aboutMe: '' });
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getUserProfile(id);
        setProfile(data.user);
        setMatches(data.matchHistory || []);
        setTotalMatches(data.totalMatches || 0);
        setWinsLastMonth(data.winsLastMonth || 0);
        setLossesLastMonth(data.lossesLastMonth || 0);
        setHasMore((data.matchHistory?.length || 0) < (data.totalMatches || 0));
        setForm({ email: data.user.email || '', aboutMe: data.user.aboutMe || '' });
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function loadMore() {
    setLoadingMore(true);
    const nextPage = matchPage + 1;
    try {
      const res = await apiFetch(`/users/${id}?matchPage=${nextPage}`);
      const data = await res.json();
      const newMatches = data.matchHistory || [];
      setMatches(prev => {
        const combined = [...prev, ...newMatches];
        setHasMore(combined.length < (data.totalMatches || 0));
        return combined;
      });
      setMatchPage(nextPage);
    } catch {
      // fail silently
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updates = {};
      if (form.email !== profile.email) updates.email = form.email;
      if (form.aboutMe !== profile.aboutMe) updates.aboutMe = form.aboutMe;
      if (newPassword) updates.password = newPassword;

      const data = await updateProfile(id, updates);
      setProfile(prev => ({ ...prev, ...(data.user || updates) }));
      setSuccess('Profile updated');
      setEditMode(false);
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profileImage', file);
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`http://localhost:4567/api/users/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      setProfile(prev => ({ ...prev, profileImage: data.user?.profileImage || prev.profileImage }));
    } catch {
      setError('Failed to upload image');
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!profile) return <p>User not found.</p>;

  return (
    <main>


      <section>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>


          <div style={{ textAlign: 'center' }}>
            {profile.profileImage
              ? <img src={imgUrl(profile.profileImage)} alt="avatar"
                  style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
              : <div className="avatar" style={{ width: 88, height: 88, fontSize: 36 }}>
                  {profile.username?.[0]?.toUpperCase()}
                </div>
            }
            {canEdit && (
              <label style={{ display: 'block', marginTop: 8, fontSize: 13, color: 'var(--accent)', cursor: 'pointer' }}>
                Change photo
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </label>
            )}
          </div>


          <div style={{ flex: 1 }}>
            <h1 style={{ marginBottom: 4 }}>{profile.username}</h1>
            {profile.email && <p className="text-muted">{profile.email}</p>}
            {profile.aboutMe
              ? <p style={{ marginTop: 8 }}>{profile.aboutMe}</p>
              : isOwner && <p className="text-muted" style={{ marginTop: 8 }}>No bio yet — add one in Edit profile.</p>
            }
            {!profile.isEmailVerified && isOwner && (
              <p style={{ color: '#dc2626', fontSize: 14, marginTop: 6 }}>Email not verified</p>
            )}
          </div>

          {canEdit && !editMode && (
            <button onClick={() => setEditMode(true)}>Edit profile</button>
          )}
        </div>

        {success && !editMode && <p className="form-success" style={{ marginTop: 12 }}>{success}</p>}
      </section>


      {editMode && (
        <section>
          <h2>Edit profile</h2>
          <form onSubmit={handleSave} style={{ maxWidth: 480 }}>
            {isOwner && (
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            )}
            <div className="form-group">
              <label>About me</label>
              <textarea rows={3} value={form.aboutMe}
                onChange={e => setForm(f => ({ ...f, aboutMe: e.target.value }))}
                placeholder="Tell others a bit about yourself" />
            </div>
            {isOwner && (
              <div className="form-group">
                <label>New password <span className="text-muted">(leave blank to keep current)</span></label>
                <input type="password" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 8 chars, one uppercase, one digit" />
              </div>
            )}
            {error && <p className="form-error">{error}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <button type="button" onClick={() => { setEditMode(false); setError(''); }}>Cancel</button>
            </div>
          </form>
        </section>
      )}


      <section>
        <h2>Stats</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {Object.entries(ELO_LABELS).map(([key, label]) => (
            <div key={key} className="card" style={{ minWidth: 140, textAlign: 'center' }}>
              <p className="text-muted" style={{ fontSize: 13 }}>{label}</p>
              <strong style={{ fontSize: 28, color: 'var(--accent)' }}>
                {profile.eloRatings?.[key] ?? 1000}
              </strong>
              <p className="text-muted" style={{ fontSize: 12 }}>ELO</p>
            </div>
          ))}
          <div className="card" style={{ minWidth: 120, textAlign: 'center' }}>
            <p className="text-muted" style={{ fontSize: 13 }}>Total games</p>
            <strong style={{ fontSize: 28 }}>{totalMatches}</strong>
          </div>
          <div className="card" style={{ minWidth: 120, textAlign: 'center' }}>
            <p className="text-muted" style={{ fontSize: 13 }}>Wins (30 days)</p>
            <strong style={{ fontSize: 28, color: '#16a34a' }}>{winsLastMonth}</strong>
          </div>
          <div className="card" style={{ minWidth: 120, textAlign: 'center' }}>
            <p className="text-muted" style={{ fontSize: 13 }}>Losses (30 days)</p>
            <strong style={{ fontSize: 28, color: '#dc2626' }}>{lossesLastMonth}</strong>
          </div>
          <div className="card" style={{ minWidth: 120, textAlign: 'center' }}>
            <p className="text-muted" style={{ fontSize: 13 }}>Points</p>
            <strong style={{ fontSize: 28 }}>{profile.points ?? 0}</strong>
          </div>
        </div>
      </section>


      <section>
        <h2>Recent games</h2>
        {matches.length === 0 ? (
          <p className="text-muted">No games played yet.</p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {matches.map(match => {
                const won = match.outcome?._id === id || match.outcome === id;
                const opponents = match.players
                  ?.filter(p => (p._id || p) !== id)
                  .map(p => p.username)
                  .join(', ') || 'Unknown';

                return (
                  <Link key={match._id} to={`/games/${match._id}`} style={{ textDecoration: 'none' }}>
                    <article className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: 500, color: 'var(--text-h)' }}>vs {opponents}</p>
                        <p className="text-muted">
                          {match.category?.timeControl}s · Best of {match.category?.bestOf}
                        </p>
                      </div>
                      <span className="badge" style={{
                        background: won ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.08)',
                        color: won ? '#16a34a' : '#dc2626',
                        borderColor: won ? '#16a34a' : '#dc2626'
                      }}>
                        {won ? 'Win' : 'Loss'}
                      </span>
                    </article>
                  </Link>
                );
              })}
            </div>

            {hasMore && (
              <button onClick={loadMore} disabled={loadingMore} style={{ marginTop: 16 }}>
                {loadingMore ? 'Loading...' : `Load more (${matches.length} of ${totalMatches})`}
              </button>
            )}
          </>
        )}
      </section>

    </main>
  );
}
