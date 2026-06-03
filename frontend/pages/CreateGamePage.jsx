// import { Link } from 'react-router-dom';
import "./CreateGame.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMatch } from "../src/api/matchesApi";

export default function CreateGamePage() {
  const navigate = useNavigate();

  const [bestOf, setBestOf] = useState(3);
  const [straightsAllowed, setStraightsAllowed] = useState(true);
  const [timeControl, setTimeControl] = useState(30);
  const [playerCount, setPlayerCount] = useState(2);
  const [buyIn, setBuyIn] = useState(1);

  async function handleCreateMatch(e) {
    e.preventDefault();

    const newMatch = await createMatch({
      category: {
        bestOf,
        straightsAllowed,
        timeControl,
        playerCount,
        buyIn,
      },
    });
    console.log("RESPONSE:", newMatch);

    const matchId = newMatch.match?._id;

    if (!matchId) {
      console.log("No match id found");
      return;
    }

    navigate(`/games/${matchId}`);

  }

  return (
    <div>
      <h1>Create Game Page</h1>

      <form className="createGame-wrapper" onSubmit={handleCreateMatch}>
        <h3>Welcome!</h3>
        <p>Choose match length and game mode. Then START GAME</p>

        <h4>Match length</h4>
        <select
          name="bestOf"
          id="bestOf"
          value={bestOf}
          onChange={(e) => setBestOf(Number(e.target.value))}
        >
          <option value="3">Best of 3</option>
          <option value="5">Best of 5</option>
          <option value="7">Best of 7</option>
        </select>

        <h4>Time control</h4>
        <select
          name="timeControl"
          id="timeControl"
          value={timeControl}
          onChange={(e) => setTimeControl(Number(e.target.value))}
        >
          <option value="10">Quick</option>
          <option value="30">Standard</option>
          <option value="90">Classical</option>
        </select>

        <h4>Players</h4>
        <select
          name="playerCount"
          id="playerCount"
          value={playerCount}
          onChange={(e) => setPlayerCount(Number(e.target.value))}
        >
          <option value="2">2 players</option>
          <option value="3">3 players</option>
          <option value="5">5 players</option>
        </select>

        <h4>Buy-in</h4>
        <select
          name="buyIn"
          id="buyIn"
          value={buyIn}
          onChange={(e) => setBuyIn(Number(e.target.value))}
        >
          <option value="1">1</option>
          <option value="10">10</option>
          <option value="50">50</option>
        </select>

        <h4>Straights</h4>
        <input
          id="straightCheck"
          type="checkbox"
          checked={straightsAllowed}
          onChange={(e) => setStraightsAllowed(e.target.checked)}
        />

        <button id="start-btn" type="submit">
          START GAME
        </button>
      </form>
    </div>
  );
}