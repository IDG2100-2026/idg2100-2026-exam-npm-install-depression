import { Link } from 'react-router-dom'

export default function TournamentPage() {
  return (
  <div>
  <h1>Tournament page</h1>
  <Link to="/games/:id">Join game</Link>
  </div>
  )
}