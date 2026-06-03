import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getMatches,
  joinMatch,
  getCurrentUser
} from '../api/matchesApi';

function AvailableGamesCard() {
  const [matches, setMatches] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      const matchesData = await getMatches();

      const waitingMatches = matchesData.filter(
        (match) => match.status === 'waiting'
      );

      setMatches(waitingMatches);

      try {
        const userData = await getCurrentUser();
        setCurrentUser(userData);
      } catch {
        setCurrentUser(null);
      }
    }

    loadData();
  }, []);

  async function handleJoin(matchId) {
    await joinMatch(matchId);
    navigate(`/games/${matchId}`);
  }

  return (
    <section className="available-games-card">
      <div className="available-games-card__header">
        <h2>Available Games</h2>
      </div>

      <div className="available-games-card__content">
        {matches.length === 0 ? (
          <p>No games available right now.</p>
        ) : (
          matches.map((match) => {
            const userId = currentUser?._id;
            const userPoints = currentUser?.points ?? 0;

            const matchIsFull =
              (match.players?.length || 0) >= match.category?.playerCount;

            const canJoin =
              userId &&
              match.status === 'waiting' &&
              userPoints >= match.category?.buyIn &&
              !matchIsFull;

            return (
              <article className="available-games-card__item" key={match._id}>
                <h3>Match {match._id}</h3>

                <p>
                  Players: {match.players?.length || 0}/
                  {match.category?.playerCount}
                </p>

                <p>Best of: {match.category?.bestOf}</p>
                <p>Buy-in: {match.category?.buyIn}</p>

                {canJoin ? (
                  <button onClick={() => handleJoin(match._id)}>
                    Join game
                  </button>
                ) : (
                  <Link to={`/games/${match._id}`}>
                    Spectate
                    {userPoints < match.category?.buyIn &&
                      ' (not enough points)'}
                  </Link>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

export default AvailableGamesCard;