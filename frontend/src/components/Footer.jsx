import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer>
      <p>Spanish Poker Dice © 2024–2026</p>
      <nav>
        <Link to="/terms">Terms and conditions</Link>
        <Link to="/privacy">Privacy policy</Link>
      </nav>
    </footer>
  );
}

export default Footer;