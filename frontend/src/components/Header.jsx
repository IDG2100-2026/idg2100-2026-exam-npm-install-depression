import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCurrentUser, isAdmin, logout } from '../api/authApi.js';

const BOARD_COLORS = [
  { label: 'Green',     value: '#2d5016' },
  { label: 'Navy',      value: '#1a2744' },
  { label: 'Burgundy',  value: '#4a1020' },
  { label: 'Dark grey', value: '#1e1e1e' },
];

function getStoredTheme() {
  return localStorage.getItem('theme') || 'auto';
}

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [panelOpen, setPanelOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(getStoredTheme());
  const [soundOn, setSoundOn] = useState(localStorage.getItem('soundEnabled') !== 'false');
  const [boardBg, setBoardBg] = useState(localStorage.getItem('boardBg') || '#2d5016');
  const [lobbyCount, setLobbyCount] = useState(Number(localStorage.getItem('lobbyCount')) || 6);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') html.setAttribute('data-theme', 'dark');
    else if (theme === 'light') html.setAttribute('data-theme', 'light');
    else html.removeAttribute('data-theme');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--board-bg', boardBg);
    localStorage.setItem('boardBg', boardBg);
  }, [boardBg]);

  useEffect(() => {
    setUser(getCurrentUser());
    function syncUser() { setUser(getCurrentUser()); }
    window.addEventListener('storage', syncUser);     // other tabs
    window.addEventListener('authChanged', syncUser); // same tab (login/logout)
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('authChanged', syncUser);
    };
  }, []);

  async function handleLogout() {
    await logout();
    setUser(null);
    navigate('/');
    setMobileOpen(false);
  }

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    localStorage.setItem('soundEnabled', String(next));
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <header>
      {/* Desktop: left nav links */}
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/lobby">Lobby</Link>
        <Link to="/tournaments">Tournaments</Link>
        <Link to="/about">About</Link>
        <Link to="/about-dice">How to play</Link>
        {isAdmin() && <Link to="/admin">Admin</Link>}
      </nav>

      {/* Desktop: right controls */}
      <div className="nav-controls">
        <button onClick={() => setPanelOpen(p => !p)} aria-label="Appearance settings">
          ⚙ Appearance
        </button>

        {user ? (
          <>
            <Link to={`/profile/${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="avatar">{user.username?.[0]?.toUpperCase()}</span>
              {user.username}
            </Link>
            <button onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <Link to="/login">Log in</Link>
        )}
      </div>

      {/* Mobile: hamburger button */}
      <button
        className="hamburger"
        onClick={() => { setMobileOpen(o => !o); setPanelOpen(false); }}
        aria-label="Open menu"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Desktop: appearance panel dropdown */}
      {panelOpen && (
        <div className="appearance-panel">
          <section>
            <strong>Theme</strong>
            <div className="panel-row">
              {['light', 'dark'].map(t => (
                <button
                  key={t}
                  className={theme === t ? 'active' : ''}
                  onClick={() => setTheme(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </section>

          <section>
            <strong>Sound</strong>
            <div className="panel-row">
              <button onClick={toggleSound}>
                {soundOn ? '🔊 On' : '🔇 Off'}
              </button>
            </div>
          </section>

          <section>
            <strong>Board color</strong>
            <div className="panel-row">
              {BOARD_COLORS.map(c => (
                <button
                  key={c.value}
                  title={c.label}
                  className={`color-swatch${boardBg === c.value ? ' active' : ''}`}
                  onClick={() => setBoardBg(c.value)}
                  style={{ background: c.value }}
                />
              ))}
            </div>
          </section>

          <section>
            <strong>Games in lobby preview</strong>
            <div className="panel-row">
              {[3, 6, 9, 12].map(n => (
                <button
                  key={n}
                  className={lobbyCount === n ? 'active' : ''}
                  onClick={() => { setLobbyCount(n); localStorage.setItem('lobbyCount', n); }}
                >
                  {n}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Mobile: full menu drawer */}
      {mobileOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={closeMobile}>Home</Link>
          <Link to="/lobby" onClick={closeMobile}>Lobby</Link>
          <Link to="/tournaments" onClick={closeMobile}>Tournaments</Link>
          <Link to="/about" onClick={closeMobile}>About</Link>
          <Link to="/about-dice" onClick={closeMobile}>How to play</Link>
          {isAdmin() && <Link to="/admin" onClick={closeMobile}>Admin</Link>}

          <div className="mobile-divider" />

          {/* Appearance settings inline in mobile menu */}
          <div style={{ padding: '4px 12px 8px' }}>
            <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 6 }}>Theme</div>
            <div className="panel-row">
              {['light', 'dark'].map(t => (
                <button key={t} className={theme === t ? 'active' : ''} onClick={() => setTheme(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '4px 12px 8px' }}>
            <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 6 }}>Sound</div>
            <button onClick={toggleSound}>{soundOn ? '🔊 On' : '🔇 Off'}</button>
          </div>

          <div className="mobile-divider" />

          {user ? (
            <>
              <Link to={`/profile/${user.id}`} onClick={closeMobile}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="avatar">{user.username?.[0]?.toUpperCase()}</span>
                {user.username}
              </Link>
              <button onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <Link to="/login" onClick={closeMobile}>Log in</Link>
          )}
        </div>
      )}
    </header>
  );
}
