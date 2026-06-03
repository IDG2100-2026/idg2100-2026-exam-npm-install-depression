import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMatches } from '../api/matchesApi';

function TopGamesCard() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    async function loadMatches() {
      const data = await getMatches();
      setMatches(data);
    }

    loadMatches();
  }, []);

  const ongoingMatches = matches.filter(
    (match) => match.status === 'ongoing'
  );

  return (
    <section className="top-games-card">
      <div className="top-games-card__header">
        <h2>Top Games Being Played</h2>
      </div>

      <div className="top-games-card__content">
        {ongoingMatches.map((match) => (
          <article className="top-games-card__item" key={match._id}>
            <h3>Match {match._id}</h3>

            <p>Status: {match.status}</p>
            <p>
              Players: {match.players?.length || 0}/
              {match.category?.playerCount}
            </p>
            <p>Best of: {match.category?.bestOf}</p>
            <p>Buy-in: {match.category?.buyIn}</p>

            <Link to={`/games/${match._id}`}>
              Spectate
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TopGamesCard;