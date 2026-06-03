import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTournamentById, joinTournament, leaveTournament } from "../src/api/tournamentsApi";
import { getCurrentUser } from "../src/api/matchesApi";
import CommentSection from "../src/components/CommentSection";
import { addTournamentComment } from "../src/api/tournamentsApi";


function TournamentPage() {
  const { id } = useParams();

  const [tournament, setTournament] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

useEffect(() => {
  async function loadData() {
    const tournamentData = await getTournamentById(id);
    setTournament(tournamentData);

    try {
      const userData = await getCurrentUser();
      setCurrentUser(userData);
    } catch {
      setCurrentUser(null);
    }
  }

  loadData();
}, [id]);

  if (!tournament) {
    return <p>Loading tournament...</p>;
  }

  // const currentUser = {
  //   _id: "1",
  //   username: "pokerqueen67",
  //   role: "admin",
  //   isLoggedIn: true,
  // };

  const isAdmin = currentUser?.role === "admin";

  const isJoined = currentUser
  ? tournament.participants?.some((player) => {
      if (typeof player === "string") {
        return player === currentUser._id;
      }

      return player._id === currentUser._id;
    })
  : false;


  const canJoin =
  currentUser &&
  tournament.status === "upcoming" &&
  !isJoined &&
  tournament.participants?.length < tournament.rules?.maxParticipants;

  const canLeave = currentUser && isJoined;

  async function handleJoin() {
    try {
        await joinTournament(tournament._id);

        const updated = await getTournamentById(tournament._id);
        setTournament(updated);
    } catch (err) {
        alert(err.message);
    }
}

async function handleLeave() {
  try {
    await leaveTournament(tournament._id);

    const updated = await getTournamentById(tournament._id);
    setTournament(updated);
  } catch (err) {
    alert(err.message);
  }
}

  return (
    <main className="tournament-page">
      <h1>{tournament.title}</h1>

      <p>Status: {tournament.status}</p>
      <p>Created by {tournament.author?.username}</p>
      <p>Starts: {new Date(tournament.startDate).toLocaleString()}</p>

      <h2>Description</h2>
      <p>{tournament.description}</p>

      <h2>Trophy</h2>
      <p>🏆 {tournament.trophy?.title}</p>

      <h2>Rules</h2>
      <p>Variant: {tournament.format?.variant}</p>
      <p>Rounds: {tournament.format?.rounds}</p>
      <p>Break length: {tournament.format?.breakLength}</p>
      <p>
        Elo: {tournament.rules?.eloMin} - {tournament.rules?.eloMax}
      </p>
      <p>Buy-in: {tournament.rules?.buyIn} points</p>
      <p>Max players: {tournament.rules?.maxParticipants}</p>

      <h2>Actions</h2>

      {canJoin && (
        <button onClick={handleJoin}>
          Join tournament
        </button>
      )}

      {canLeave && (
        <button onClick={handleLeave}>
          Leave tournament
        </button>
      )}

      {!currentUser && <Link to="/login">Log in to join</Link>}

      {isAdmin && (
        <>
          <button>Delete tournament</button>
          <button>Cancel tournament</button>
          <Link to={`/admin/tournaments/edit/${tournament._id}`}>
            Edit tournament
          </Link>
        </>
      )}

    <h2>Joined players</h2>

    {tournament.participants?.length === 0 ? (
      <p>No players have joined yet.</p>
    ) : (
      <ul>
        {tournament.participants?.map((player) => (
          <li key={player._id || player}>
            {player.username || player}
          </li>
        ))}
      </ul>
    )}

      {tournament.winner && (
        <>
          <h2>Winner</h2>
          <p>{tournament.winner.username}</p>
        </>
      )}

      {tournament.status === "ongoing" && (
        <>
          <h2>Current round</h2>
          <p>{tournament.currentRound}</p>

          <h2>Ongoing games</h2>

          <ul>
            {tournament.matches?.map((matchId) => (
              <li key={matchId}>
                <Link to={`/games/${matchId}`}>View game</Link>
              </li>
            ))}
          </ul>
        </>
      )}

    <CommentSection
      entityType="tournament"
      entityId={tournament._id}
      comments={tournament.comments || []}
      addComment={addTournamentComment}
      onCommentAdded={(comment) =>
        setTournament((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), comment],
        }))
      }
    />
    </main>
  );
}

export default TournamentPage;