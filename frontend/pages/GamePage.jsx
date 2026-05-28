import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMatchById } from '../src/api/matchesApi';

// const mockMatch = {
//   _id: 'match123',
//   status: 'ongoing', // waiting | ongoing | finished
//   gamePhase: 'rolling', // rolling | betting | revealing | gameEnd

//   players: [
//     {
//       userId: 'u1',
//       username: 'Laura',
//       stack: 1000,
//       isCurrentTurn: true,
//       dice: ['A', 'K', 'Q', 'J', '8'],
//       heldDice: [false, true, false, false, true],
//     },
//     {
//       userId: 'u2',
//       username: 'Pedri',
//       stack: 900,
//       isCurrentTurn: false,
//       dice: ['?', '?', '?', '?', '?'],
//       heldDice: [false, false, false, false, false],
//     },
//   ],

//   currentRound: 1,
//   pot: 0,
//   currentBet: 0,
//   currentTurnPlayerId: 'u1',
// };

export default function GamePage() {
  // const [match] = useState(mockMatch);

  const { id } = useParams();

const [match, setMatch] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadMatch() {
    const data = await getMatchById(id);

    console.log(data);

    setMatch(data.match || data);
    setLoading(false);
  }

  loadMatch();
}, [id]);

if (loading) {
  return <p>Loading match...</p>;
}

if (!match) {
  return <p>Match not found.</p>;
}

  return (
    <main>
      <h1>Game Page</h1>

      <section>
        <h2>Match info</h2>
        <p>Status: {match.status}</p>
        <p>Phase: {match.roundPhase || 'No phase yet'}</p>
        <p>Round: {match.currentRound}</p>
        <p>Pot: {match.pot}</p>
        <p>Current bet: {match.currentBet}</p>
      </section>

      {match.status === 'waiting' && <WaitingRender match={match} />}

      {match.status === 'ongoing' && (
        <OngoingRender match={match} />
      )}

      {match.status === 'completed' && <FinishedRender match={match} />}
    </main>
  );
}

function WaitingRender({ match }) {
  return (
    <section>
      <h2>Waiting for players</h2>
      <p>Players joined: {match.players.length}</p>

      {match.players.map((player) => (
        <article key={player.userId}>
          <h3>{player.username}</h3>
          <p>Stack: {player.stack}</p>
        </article>
      ))}
    </section>
  );
}

function OngoingRender({ match }) {
  return (
    <section>
      <h2>Game ongoing</h2>

      {match.roundPhase === 'rolling' && <RollingRender match={match} />}
      {match.roundPhase === 'betting' && <BettingRender match={match} />}
      {match.roundPhase === 'revealing' && <RevealingRender match={match} />}
      {match.roundPhase === 'gameEnd' && <GameEndRender match={match} />}
    </section>
  );
}

function RollingRender({ match }) {
  return (
    <section>
      <h3>Rolling phase</h3>
      <p>Current turn: {match.currentTurnPlayerId}</p>

      {match.players.map((player) => (
        <article key={player.userId}>
          <h4>{player.username}</h4>
          <p>Stack: {player.stack}</p>
          <p>Current turn: {player.isCurrentTurn ? 'Yes' : 'No'}</p>
          <p>Dice: {player.dice.join(' ')}</p>
          <p>Held dice: {player.heldDice.join(', ')}</p>
        </article>
      ))}
    </section>
  );
}

function BettingRender({ match }) {
  return (
    <section>
      <h3>Betting phase</h3>
      <p>Pot: {match.pot}</p>
      <p>Current bet: {match.currentBet}</p>
    </section>
  );
}

function RevealingRender({ match }) {
  return (
    <section>
      <h3>Revealing phase</h3>

      {match.players.map((player) => (
        <article key={player.userId}>
          <h4>{player.username}</h4>
          <p>Dice: {player.dice.join(' ')}</p>
        </article>
      ))}
    </section>
  );
}

function GameEndRender({ match }) {
  return (
    <section>
      <h3>Game end</h3>
      <p>The game has ended.</p>
    </section>
  );
}

function FinishedRender({ match }) {
  return (
    <section>
      <h2>Match finished</h2>
      <p>Final round: {match.currentRound}</p>

      {match.players.map((player) => (
        <article key={player.userId}>
          <h3>{player.username}</h3>
          <p>Final stack: {player.stack}</p>
        </article>
      ))}
    </section>
  );
}