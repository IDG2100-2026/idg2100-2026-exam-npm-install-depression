import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../src/api/authApi.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', age: '' });
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
      await register(form.username, form.email, form.password, Number(form.age));
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username <span className="text-muted">(3–30 characters, letters/numbers/_)</span></label>
          <input name="username" value={form.username} onChange={handleChange}
            required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" />
        </div>
        <div>
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Password <span className="text-muted">(min. 8 chars, one uppercase, one digit)</span></label>
          <input name="password" type="password" value={form.password} onChange={handleChange}
            required minLength={8} />
        </div>
        <div>
          <label>Age <span className="text-muted">(must be 18 or older)</span></label>
          <input name="age" type="number" value={form.age} onChange={handleChange}
            required min={18} />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: 12 }}>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}