import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMatchById, getCurrentUser } from '../src/api/matchesApi';
import GameBoard from '../src/components/game/GameBoard';
import CommentSection from '../src/components/CommentSection';
import { addMatchComment } from "../src/api/matchesApi";

export default function GamePage() {
  const { id } = useParams();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const comments = match?.comments || [];

  useEffect(() => {
    async function loadMatch() {
      const data = await getMatchById(id);
      console.log(data);
      setMatch(data.match || data);

      try {
        const userData = await getCurrentUser();
        setCurrentUser(userData);
      } catch {
        setCurrentUser(null);
      }

      setLoading(false);
    }
    loadMatch();
  }, [id]);


  if (loading) return <p>Loading match...</p>;
  if (!match) return <p>Match not found.</p>;

  const currentUserId = currentUser?._id;


  const isPlayer = match.players?.some((player) => {
    const playerId = player.userId?._id || player.userId || player._id;
    return String(playerId) === String(currentUserId);
  });


  return (
    <main>
      <h1>Game Page</h1>

      <GameBoard
        match={match}
        isPlayer={isPlayer}
        currentUserId={currentUserId}
      />

      <section>
        <h2>Match info</h2>
        <p>Mode: {isPlayer ? "Playing" : "Spectating"}</p>
        <p>Game Status: Game {match.status}</p>
        <p>
          Round Phase: {match.status === "ongoing" ? match.roundPhase : "None"}
        </p>
        <p>Players Joined: {match.players.length}</p>
        <p>Best of: {match.category.bestOf}</p>
         <p>
          Straights Allowed: {match.category.straightsAllowed ? "Yes" : "No"}
        </p>
        <p>Time Control: {match.category.timeControl}s</p>

      </section>

    <CommentSection
      entityType="match"
      entityId={match._id}
      comments={comments}
      addComment={addMatchComment}
      onCommentAdded={(comment) =>
        setMatch((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), comment],
        }))
      }
    />
    </main>
  );
}


