import { Link } from 'react-router-dom';
import UpcomingTournamentCard from "../src/components/UpcomingTournamentsCard";
import AvailableGamesCard from "../src/components/AvailableGamesCard";
import TopGamesCard from "../src/components/TopGamesCard";
import ActivityCard from "../src/components/ActivityCard";

export default function HomePage() {
  return (
    <div className="home-page">

      <section className="home-hero">
        <h1>Spanish Poker Dice Platform</h1>
        <p>
          Play games, join tournaments and climb the rankings.
        </p>

        <Link to="/games/new">
          Create a new game
        </Link>
      </section>

      <section className="home-activity">
        <h2>Platform Activity</h2>
        <ActivityCard />
      </section>

      <section className="home-tournaments">

        <UpcomingTournamentCard />

        <Link to="/tournaments">
          View all tournaments
        </Link>
      </section>

      <section className="home-lobby-preview">

        <AvailableGamesCard />

        <Link to="/lobby">
          View lobby
        </Link>
      </section>

      <section className="home-top-games">

        <TopGamesCard />
      </section>

    </div>
  );
}