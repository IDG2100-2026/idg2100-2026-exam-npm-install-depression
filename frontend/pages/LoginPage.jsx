import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
  <div>
  <h1>Login Page</h1>

  <Link to="/forgot-password">Forgot password?</Link>
  <Link to="/register">Register</Link>
  </div>
)
}