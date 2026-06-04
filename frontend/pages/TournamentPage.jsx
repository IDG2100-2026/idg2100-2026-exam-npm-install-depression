import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTournamentById, joinTournament, leaveTournament } from "../src/api/tournamentsApi";
import { getCurrentUser, isAdmin as checkIsAdmin } from "../src/api/authApi";
import { apiFetch } from "../src/api/apiClient";
import CommentSection from "../src/components/CommentSection";
import { addTournamentComment } from "../src/api/tournamentsApi";

function formatCountdown(ms) {
  if (ms <= 0) return 'Starting...';
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000) % 24;
  const d = Math.floor(ms / 86400000);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}


function TournamentPage() {
  const { id } = useParams();

  const [tournament, setTournament] = useState(null);
  const [currentUser] = useState(getCurrentUser());
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    async function loadData() {
      const tournamentData = await getTournamentById(id);
      setTournament(tournamentData);
    }
    loadData();
  }, [id]);


  useEffect(() => {
    if (!tournament || tournament.status !== 'upcoming') return;

    const startTime = new Date(tournament.startDate).getTime();

    async function autoStart() {
      try {
        await apiFetch(`/tournaments/${id}/status`, { method: 'PATCH' });
        const updated = await getTournamentById(id);
        setTournament(updated);
      } catch {
        const updated = await getTournamentById(id);
        setTournament(updated);
      }
    }

    function tick() {
      const diff = startTime - Date.now();
      setTimeLeft(diff);
      if (diff <= 0) autoStart();
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tournament?.startDate, tournament?.status]);

  if (!tournament) {
    return <p>Loading tournament...</p>;
  }


  const isAdmin = checkIsAdmin();

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
      <p>Starts: {new Date(tournament.startDate).toLocaleString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      {tournament.status === 'upcoming' && timeLeft !== null && (
        <p><strong>Starts in: {formatCountdown(timeLeft)}</strong></p>
      )}

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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          <Link to={`/admin/tournaments?id=${tournament._id}`}>
            <button>Edit tournament</button>
          </Link>
          {tournament.status === 'upcoming' && (
            <button onClick={async () => {
              if (!confirm('Cancel this tournament? Players will no longer be able to join.')) return;
              await apiFetch(`/tournaments/${tournament._id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'cancelled' })
              });
              setTournament(await getTournamentById(tournament._id));
            }}>Cancel tournament</button>
          )}
          <button className="btn-danger" onClick={async () => {
            if (!confirm(`Delete "${tournament.title}"? This cannot be undone.`)) return;
            await apiFetch(`/tournaments/${tournament._id}`, { method: 'DELETE' });
            window.location.href = '/tournaments';
          }}>Delete tournament</button>
        </div>
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