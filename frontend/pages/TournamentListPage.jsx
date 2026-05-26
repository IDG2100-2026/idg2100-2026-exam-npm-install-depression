import { Link } from 'react-router-dom';

export default function TournamentListPage() {
  return (
  <div>
    <h1>Tournament List Page</h1>
    <Link to="/tournaments/:id">Tournament</Link>
  </div>
  )
}