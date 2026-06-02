import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main style={{ textAlign: 'center', padding: '60px 20px' }}>
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/">Go home</Link>
    </main>
  );
}
