import { Link } from 'react-router-dom';

export default function CreateGamePage() {
  return (
  <div>
  <h1>Create Game Page</h1>
  <Link to="/games/:id">Create game</Link>

  </div>
  )
}