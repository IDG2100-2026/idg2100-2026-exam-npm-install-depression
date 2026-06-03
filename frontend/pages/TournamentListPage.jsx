import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
// import { tournaments as mockTournaments} from '../src/data/mockTournaments';
import { getTournaments } from '../src/api/tournamentsApi';


export default function TournamentListPage() {
    const [tournaments, setTournaments] = useState([]);

  useEffect(() => {

    
    async function loadTournaments() {
      const data = await getTournaments();
      console.log(data);
      setTournaments(data.tournaments);
    }

    loadTournaments();
    
  }, []);

  //SEARCH BAR

  const [searchTerm, setSearchTerm] = useState('');

  const searchedTournaments = tournaments.filter((tournament) => {
  if (searchTerm.length < 3) {
    return true;
  }

  return tournament.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  //SORTING

  const [sortBy, setSortBy] = useState('newest');

  const sortedTournaments = [...searchedTournaments].sort((a, b) => {
  if (sortBy === 'newest') {
    return new Date(b.date) - new Date(a.date);
  }

  if (sortBy === 'oldest') {
    return new Date(a.date) - new Date(b.date);
  }

  if (sortBy === 'title') {
    return a.title.localeCompare(b.title);
  }

  if (sortBy === 'players') {
    return b.players - a.players;
  }

  return 0;
  });

  const upcomingTournaments = sortedTournaments.filter(
    (tournament) => tournament.status === 'upcoming'
  );

  const ongoingTournaments = sortedTournaments.filter(
    (tournament) => tournament.status === 'ongoing'
  );

  const finishedTournaments = sortedTournaments.filter(
    (tournament) => tournament.status === 'finished'
  );

  console.log(tournaments);
  

  return (
  <div>
    <h1>Tournament List Page</h1>
    <input
      type="text"
      placeholder="Search tournaments..."
      value={searchTerm}
      onChange={(event) => setSearchTerm(event.target.value)}
    />
    <select
      value={sortBy}
      onChange={(event) => setSortBy(event.target.value)}
    >
      <option value="newest">Newest first</option>
      <option value="oldest">Oldest first</option>
      <option value="title">A-Z</option>
      <option value="players">Most players</option>
    </select>

    <section>
      <h2>Upcoming tournaments</h2>
          {upcomingTournaments.map((tournament) => (
          <article key={tournament._id}>
            <h3>{tournament.title}</h3>
            <p>Date: {new Date(tournament.startDate).toLocaleString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p>
              Players: {tournament.participants.length}/{tournament.rules.maxParticipants}
            </p>
            <p>Description: {tournament.description} </p>
            {console.log(tournament)}
            <Link to={`/tournaments/${tournament._id}`}>View tournament</Link>
          </article>
        ))}
    </section>
    <section>
      <h2>Ongoing tournaments</h2>
      {ongoingTournaments.map((tournament) => (
        <article key={tournament._id}>
          <h3>{tournament.title}</h3>
            <p>Date: {new Date(tournament.startDate).toLocaleString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p>
              Players: {tournament.participants.length}/{tournament.rules.maxParticipants}
            </p>
            <Link to={`/tournaments/${tournament._id}`}>View tournament</Link>
        </article>
      ))}
    </section>
    <section>
      <h2>Finished tournaments</h2>
      {finishedTournaments.map((tournament) => (
        <article key={tournament._id}>
          <h3>{tournament.title}</h3>
            <p>Date: {new Date(tournament.startDate).toLocaleString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p>
              Players: {tournament.participants.length}/{tournament.rules.maxParticipants}
            </p>
            <p>Description: {tournament.description} </p>
            <Link to={`/tournaments/${tournament._id}`}>View tournament</Link>
            </article>
      ))}
    </section>
  </div>
  )
}