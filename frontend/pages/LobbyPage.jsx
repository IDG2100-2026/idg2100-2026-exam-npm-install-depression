import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import {
  getMatches,
  joinMatch,
  getCurrentUser
} from '../src/api/matchesApi';
import { useNavigate } from "react-router-dom";


export default function LobbyPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [straightsFilter, setStraightsFilter] = useState("all");
  const [roundsFilter, setRoundsFilter] = useState("all");
  const [playersFilter, setPlayersFilter] = useState("all");
  const [buyInFilter, setBuyInFilter] = useState("all");
  const [timeControlFilter, setTimeControlFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [matches, setMatches] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function loadData() {
      const matchesData = await getMatches();
      setMatches(matchesData);

      try {
        const userData = await getCurrentUser();
        setCurrentUser(userData);
      } catch {
        setCurrentUser(null);
      }
    }

    loadData();
  }, []);

  const navigate = useNavigate();

  async function handleJoin(matchId) {
    await joinMatch(matchId);
    navigate(`/games/${matchId}`);
  }

  const availableMatches = matches;

  const filteredMatches = availableMatches.filter(match => {
    const matchesSearch =
      searchTerm.length < 3 ||
      match._id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStraights =
      straightsFilter === "all" ||
      String(match.category?.straightsAllowed) === straightsFilter;

    const matchesRounds =
      roundsFilter === "all" ||
      Number(roundsFilter) === match.category?.bestOf;

    const matchesPlayers =
      playersFilter === "all" ||
      Number(playersFilter) === match.category?.playerCount;

    const matchesBuyIn =
      buyInFilter === "all" ||
      Number(buyInFilter) === match.category?.buyIn;

    const matchesTimeControl =
      timeControlFilter === "all" ||
      Number(timeControlFilter) === match.category?.timeControl;

    return (
      matchesSearch &&
      matchesStraights &&
      matchesRounds &&
      matchesPlayers &&
      matchesBuyIn &&
      matchesTimeControl
    );
  });

  const matchesPerPage = Number(localStorage.getItem('lobbyCount')) || 6;
  const totalPages = Math.ceil(filteredMatches.length / matchesPerPage);

  const paginatedMatches = filteredMatches.slice(
    (currentPage - 1) * matchesPerPage,
    currentPage * matchesPerPage
  );

  return (
    <div>
      <h1>Lobby Page</h1>

      <input
        type="text"
        placeholder="Search games..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />

      <select value={straightsFilter} onChange={(e) => setStraightsFilter(e.target.value)}>
        <option value="all">All straights</option>
        <option value="true">Straights enabled</option>
        <option value="false">Straights disabled</option>
      </select>

      <select value={roundsFilter} onChange={(e) => setRoundsFilter(e.target.value)}>
        <option value="all">All rounds</option>
        <option value="3">Best of 3</option>
        <option value="5">Best of 5</option>
        <option value="7">Best of 7</option>
      </select>

      <select value={playersFilter} onChange={(e) => setPlayersFilter(e.target.value)}>
        <option value="all">All players</option>
        <option value="2">2 players</option>
        <option value="3">3 players</option>
        <option value="5">5 players</option>
      </select>

      <select value={buyInFilter} onChange={(e) => setBuyInFilter(e.target.value)}>
        <option value="all">All buy-ins</option>
        <option value="1">1 point</option>
        <option value="10">10 points</option>
        <option value="50">50 points</option>
      </select>

      <select value={timeControlFilter} onChange={(e) => setTimeControlFilter(e.target.value)}>
        <option value="all">All time controls</option>
        <option value="10">10s</option>
        <option value="30">30s</option>
        <option value="90">90s</option>
      </select>

      {paginatedMatches.map(match => {
        const userId = currentUser?._id;
        const userPoints = currentUser?.points ?? 0;

        const matchIsFull =
          (match.players?.length || 0) >= match.category?.playerCount;

        const canJoin =
          userId &&
          match.status === "waiting" &&
          userPoints >= match.category?.buyIn &&
          !matchIsFull;

        return (
          <article key={match._id}>
            <h2>Match {match._id}</h2>

            <p>Status: {match.status}</p>
            <p>Players: {match.players?.length || 0}/{match.category?.playerCount}</p>
            <p>Best of: {match.category?.bestOf}</p>
            <p>Straights allowed: {match.category?.straightsAllowed ? " Yes" : " No"}</p>
            <p>Buy-in: {match.category?.buyIn}</p>

            {canJoin ? (
              <button onClick={() => handleJoin(match._id)}>
                Join game
              </button>
            ) : (
              <Link to={`/games/${match._id}`}>
                Spectate
                {userPoints < match.category?.buyIn && " (not enough points)"}
              </Link>
            )}
          </article>
        );
      })}

      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        Previous
      </button>

      <span>
        Page {currentPage} of {totalPages}
      </span>

      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}