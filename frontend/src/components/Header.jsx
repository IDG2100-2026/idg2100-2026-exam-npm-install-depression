import { Link } from 'react-router-dom';

function Header() {

  return (
    <header>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/lobby">Lobby</Link>
        <Link to="/about">About</Link>
        <Link to="/about-dice">How to play</Link>
        <Link to="/tournaments">Tournaments</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/profile/:id">Profile</Link>
        <Link to="/login">Login</Link>
        <Link to="/admin">Admin</Link>
        <h2>(Header)</h2>
      </nav>
    </header>
  );
}

export default Header;