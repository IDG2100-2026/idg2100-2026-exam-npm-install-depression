import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../src/api/authApi.js';


export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
  
    function handleChange(e) {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  
    async function handleSubmit(e) {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
        await login(form.username, form.password);
        navigate('/lobby');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input name="username" value={form.username} onChange={handleChange} required />
        </div>
        <div>
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to="/register">Register</Link>
      </div>
    </div>
  );
}