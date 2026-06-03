import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTournaments } from '../api/tournamentsApi';

function UpcomingTournamentsCard() {
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    async function loadTournaments() {
      const data = await getTournaments();
      setTournaments(data.tournaments);
    }

    loadTournaments();
  }, []);

  const upcomingTournaments = tournaments.filter(
    (tournament) => tournament.status === 'upcoming'
  );

  return (
    <section className="upcoming-tournaments-card">
      <div className="upcoming-tournaments-card__header">
        <h2>Upcoming Tournaments</h2>
      </div>

      <div className="upcoming-tournaments-card__content">
        {upcomingTournaments.map((tournament) => (
          <article
            className="upcoming-tournaments-card__item"
            key={tournament._id}
          >
            <h3>{tournament.title}</h3>

            <p>Date: {tournament.startDate}</p>

            <p>
              Players: {tournament.participants.length}/
              {tournament.rules.maxParticipants}
            </p>

            <p>{tournament.description}</p>

            <Link to={`/tournaments/${tournament._id}`}>
              View tournament
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default UpcomingTournamentsCard;