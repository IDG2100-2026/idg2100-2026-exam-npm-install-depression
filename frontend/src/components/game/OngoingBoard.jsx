import "./OngoingBoard.css";
import "./Dice.css";
import Dice from "./Dice";
import { useState } from "react";

function getDiceFace(die) {
  if (typeof die === 'string') return die; // already a face label (A/K/Q/J/9/8)
  const diceFaces = { 1: "7", 2: "8", 3: "J", 4: "Q", 5: "K", 6: "A" };
  return diceFaces[die] ?? "?";
}

function OngoingBoard({ match, currentUserId, isPlayer, myDice, myHeld, onHoldDie, onHoldDice, onReroll, onBet, onFold, timeLeft, allRolls }) {

  const getId = (value) => value?._id || value;
  const spectatorPlayer = match.playerStates?.[0];

  // Spectators follow the first player's perspective; players see their own
  const viewUserId = isPlayer ? currentUserId : getId(spectatorPlayer?.userId);

  const currentPlayerState = match.playerStates?.find((player) => {
    return String(getId(player.userId)) === String(viewUserId);
  });

  const otherPlayerStates = match.playerStates?.filter((player) => {
    return String(getId(player.userId)) !== String(viewUserId);
  }) ?? [];

  if (match.roundPhase === "rolling") {
    return (
      <RollingPhase
        match={match}
        isPlayer={isPlayer}
        currentPlayerState={currentPlayerState}
        otherPlayerStates={otherPlayerStates}
        myDice={myDice}
        myHeld={myHeld}
        onHoldDie={onHoldDie}
        onHoldDice={onHoldDice}
        onReroll={onReroll}
        onBet={onBet}
        onFold={onFold}
        timeLeft={timeLeft}
      />
    );
  }

  if (match.roundPhase === "betting") {
    return (
      <BettingPhase
        match={match}
        isPlayer={isPlayer}
        currentPlayerState={currentPlayerState}
        otherPlayerStates={otherPlayerStates}
        myDice={myDice}
        myHeld={myHeld}
        onHoldDie={onHoldDie}
        onBet={onBet}
        onFold={onFold}
        timeLeft={timeLeft}
      />
    );
  }

  if (match.roundPhase === "revealing") {
    return <RevealPhase match={match} allRolls={allRolls} />;
  }

  return null;
}

function RollingPhase({ match, isPlayer, currentPlayerState, otherPlayerStates, myDice, myHeld, onHoldDie, onHoldDice, onReroll, onBet, onFold, timeLeft }) {
  const [betAmount, setBetAmount] = useState(match.currentBet || 1);

  return (
    <div className="ongoing-board">
      <header className="ongoing-board__header">
        <div className="ongoing-board__player score">
          <p>Stack: {currentPlayerState?.stack}</p>
          <p>Pot: {match.pot}</p>
        </div>
        <div className="ongoing-board__instructions">
          <h2>Round {match.currentRound}</h2>
          <p>Click dice to hold them, press ROLL to re-roll the rest. Press STAND to keep all and move to betting.</p>
        </div>
        <div className="ongoing-board__player info">
          <h4>{currentPlayerState?.userId?.username ?? currentPlayerState?.username}</h4>
          {timeLeft !== null && <h4 className="timer">{timeLeft}s</h4>}
        </div>
      </header>

      <div className="ongoing-board__content">
        <header className="ongoing-board__players">
          {otherPlayerStates.map((player) => (
            <div className="ongoing-board__players-container" key={player.userId}>
              <p>Stack: {player.stack}</p>
              <h3>{player.username}</h3>
            </div>
          ))}
        </header>

        <section className="ongoing-board__game">
          <div className="ongoing-board__side ongoing-board__side--p1">
            <div className="ongoing-board__dice-row">
              {myDice.length > 0 ? myDice.map((die, index) => (
                <div
                  key={index}
                  onClick={() => isPlayer && onHoldDie?.(index)}
                  style={{
                    cursor: isPlayer ? 'pointer' : 'default',
                    opacity: myHeld?.[index] ? 0.5 : 1,
                    transform: myHeld?.[index] ? 'translateY(-8px)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  <Dice face={getDiceFace(die)} />
                </div>
              )) : <p>Waiting for dice...</p>}
            </div>

            <div className="ongoing-board__commands">
              {isPlayer && (
                <>
                  <button onClick={onHoldDice}>STAND</button>
                  <button onClick={onReroll}>ROLL</button>
                  <input
                    type="number"
                    value={betAmount}
                    min={match.currentBet || 1}
                    onChange={e => setBetAmount(Number(e.target.value))}
                    style={{ width: 70 }}
                  />
                  <button onClick={() => onBet?.(betAmount)}>BET</button>
                  <button onClick={onFold}>FOLD</button>
                </>
              )}
              <h4 className="timer">{match.category?.timeControl}s</h4>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function BettingPhase({ match, isPlayer, currentPlayerState, otherPlayerStates, myDice, myHeld, onHoldDie, onBet, onFold, timeLeft }) {
  const [betAmount, setBetAmount] = useState(match.currentBet || 1);

  return (
    <div className="ongoing-board">
      <header className="ongoing-board__header">
        <div className="ongoing-board__player score">
          <p>Stack: {currentPlayerState?.stack}</p>
          <p>Pot: {match.pot}</p>
        </div>
        <div className="ongoing-board__instructions">
          <h2>Round {match.currentRound} — Betting</h2>
          <p>Current bet: {match.currentBet} points. Match, raise, or fold.</p>
        </div>
        <div className="ongoing-board__player info">
          <h4>{currentPlayerState?.userId?.username ?? currentPlayerState?.username}</h4>
          {timeLeft !== null && <h4 className="timer">{timeLeft}s</h4>}
        </div>
      </header>

      <div className="ongoing-board__content">
        <header className="ongoing-board__players">
          {otherPlayerStates.map((player) => (
            <div className="ongoing-board__players-container" key={player.userId}>
              <p>Stack: {player.stack} | Bet: {player.currentRoundBet}</p>
              <h3>{player.username}{player.hasFolded ? ' (folded)' : ''}</h3>
            </div>
          ))}
        </header>

        <section className="ongoing-board__game">
          <div className="ongoing-board__side ongoing-board__side--p1">
            <div className="ongoing-board__dice-row">
              {myDice.map((die, index) => (
                <div
                  key={index}
                  onClick={() => isPlayer && onHoldDie?.(index)}
                  style={{
                    cursor: isPlayer ? 'pointer' : 'default',
                    opacity: myHeld?.[index] ? 0.5 : 1
                  }}
                >
                  <Dice face={getDiceFace(die)} />
                </div>
              ))}
            </div>

            {isPlayer && !currentPlayerState?.hasFolded && (
              <div className="ongoing-board__commands">
                <div className="ongoing-board__betting">
                  <button onClick={() => setBetAmount(a => Math.max(match.currentBet || 1, a - 1))}>-</button>
                  <p>{betAmount}</p>
                  <button onClick={() => setBetAmount(a => a + 1)}>+</button>
                </div>
                <button onClick={() => onBet?.(betAmount)}>MATCH / RAISE</button>
                <button onClick={onFold}>FOLD</button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function RevealPhase({ match, allRolls }) {
  return (
    <div className="ongoing-board">
      <header className="ongoing-board__header">
        <div className="ongoing-board__instructions">
          <h2>Round {match.currentRound} — Revealing</h2>
          <p>All dice revealed. Winner takes the pot of {match.pot} points.</p>
        </div>
      </header>

      <div className="ongoing-board__content">
        <header className="ongoing-board__players">
          {match.playerStates?.map((ps) => {
            const roll = allRolls?.find(r => String(r.userId) === String(ps.userId?._id || ps.userId));
            return (
              <div className="ongoing-board__player" key={ps.userId}>
                <h3>{ps.username}{ps.hasFolded ? ' (folded)' : ''}</h3>
                <div className="ongoing-board__dice-row">
                  {roll
                    ? roll.dice.map((die, i) => <Dice key={i} face={getDiceFace(die)} />)
                    : <p>?????</p>
                  }
                </div>
                <p>Stack: {ps.stack}</p>
              </div>
            );
          })}
        </header>
      </div>
    </div>
  );
}

export default OngoingBoard;
