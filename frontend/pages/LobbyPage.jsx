import { Link } from 'react-router-dom';

export default function LobbyPage() {
  return (
  <div>
  <h1>Lobby Page</h1>
    <Link to ="/games/:id">Join game</Link>
  </div>
  )
  
}