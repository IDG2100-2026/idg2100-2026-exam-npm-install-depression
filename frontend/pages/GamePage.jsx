import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMatchById, getCurrentUser } from '../src/api/matchesApi';
// import { io } from 'socket.io-client';
import GameBoard from '../src/components/game/GameBoard';
import CommentSection from '../src/components/CommentSection';
import { addMatchComment } from "../src/api/matchesApi";

export default function GamePage() {
  const { id } = useParams();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  // const [myDice, setMyDice] = useState([]);
  // const [myHeld, setMyHeld] = useState([false, false, false, false, false]);
  // const [socket, setSocket] = useState(null);
  // const [timeLeft, setTimeLeft] = useState(null);
  // const [allRolls, setAllRolls] = useState([]);

  // const token = localStorage.getItem('accessToken');
  // const myUserId = localStorage.getItem('userId');
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

  // SOCKET
  // useEffect(() => {
  //   const s = io('http://localhost:4567/game', { auth: { token } });
  //   s.on('connect', () => s.emit('join_match', { matchId: id }));
  //   s.on('game_state', ({ state }) => setMatch(state));
  //   s.on('game_started', ({ state }) => {
  //     setMatch(state);
  //     setTimeLeft(state.category.timeControl);
  //   });
  //   s.on('round_started', ({ state }) => {
  //     setMatch(state);
  //     setTimeLeft(state.category.timeControl);
  //     setMyHeld([false, false, false, false, false]);
  //     setAllRolls([]);
  //   });
  //   s.on('your_dice', ({ dice }) => setMyDice(dice));
  //   s.on('round_revealed', ({ state, allRolls }) => {
  //     setMatch(state);
  //     setTimeLeft(null);
  //     setAllRolls(allRolls || []);
  //   });
  //   s.on('game_over', ({ state }) => setMatch(state));
  //   setSocket(s);
  //   return () => s.disconnect();
  // }, [id, token]);

  // COUNTDOWN
  // useEffect(() => {
  //   if (timeLeft === null || timeLeft <= 0) return;
  //   const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
  //   return () => clearTimeout(t);
  // }, [timeLeft]);

  // function holdDie(index) {
  //   const next = [...myHeld];
  //   next[index] = !next[index];
  //   setMyHeld(next);
  // }
  // function emitHoldDice() { socket?.emit('hold_dice', { matchId: id, held: myHeld }); }
  // function emitReroll() { socket?.emit('reroll', { matchId: id }); }
  // function emitPlaceBet(amount) { socket?.emit('place_bet', { matchId: id, amount: Number(amount) }); }
  // function emitFold() { socket?.emit('fold', { matchId: id }); }

  if (loading) return <p>Loading match...</p>;
  if (!match) return <p>Match not found.</p>;

  const currentUserId = currentUser?._id;

  // console.log("currentUserId", currentUserId);
  // console.log("match.players", match.players);

  const isPlayer = match.players?.some((player) => {
    const playerId = player.userId?._id || player.userId || player._id;
    return String(playerId) === String(currentUserId);
  });

  // console.log("FULL MATCH:", JSON.stringify(match, null, 2));
  // console.log(comments);
  // console.log("myUserId", myUserId);
  // console.log("match.playerStates", match.playerStates);
  // console.log("match.players", match.players);
  // console.log("FULL MATCH:", JSON.stringify(match, null, 2));

  // playerStates exists after socket fires (ongoing), players exists from REST (waiting)
  // const isPlayer =
  //   match.playerStates?.some(ps => String(ps.userId) === String(myUserId)) ||
  //   match.players?.some(p => String(p._id || p) === String(myUserId));

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
      {/* <GameBoard match={match} isPlayer={isPlayer} myUserId={myUserId} /> */}

      {/* <section>
        <p>Mode: {isPlayer ? 'Playing' : 'Spectating'}</p>
        {timeLeft !== null && <p>Time left: {timeLeft}s</p>}
        <h2>Match info</h2>
        <p>Status: {match.status}</p>
        <p>Phase: {match.status === 'completed' ? 'gameEnd' : match.roundPhase || 'No phase yet'}</p>
        <p>Round: {match.currentRound}</p>
        <p>Pot: {match.pot}</p>
        <p>Current bet: {match.currentBet}</p>
      </section> */}

      {/* {match.status === 'waiting' && <WaitingRender match={match} />}

      {match.status === 'ongoing' && (
        <OngoingRender
          match={match}
          myDice={myDice}
          myHeld={myHeld}
          allRolls={allRolls}
          onHoldDie={holdDie}
          onHoldConfirm={emitHoldDice}
          onReroll={emitReroll}
          onBet={emitPlaceBet}
          onFold={emitFold}
          timeLeft={timeLeft}
          myUserId={myUserId}
        />
      )}

      {match.status === 'completed' && <FinishedRender match={match} />} */}

      {/* <CommentSection
        matchId={match._id}
        comments={comments}
        onCommentAdded={(newComment) => {
          setMatch(prev => ({
            ...prev,
            comments: [...(prev.comments || []), newComment]
          }));
        }}
      /> */}
    </main>
  );
}


