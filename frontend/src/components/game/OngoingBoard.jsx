import "./OngoingBoard.css";
import "./Dice.css";
import Dice from "./Dice";

function getDiceFace(die) {
  const diceFaces = {
    1: "7",
    2: "8",
    3: "J",
    4: "Q",
    5: "K",
    6: "A",
  };

  return diceFaces[die] ?? "?";
}

function OngoingBoard({ match, currentUserId, isPlayer }){
const getId = (value) => value?._id || value;
const spectatorPlayer = match.playerStates?.[0];

const viewUserId = isPlayer
  ? currentUserId
  : getId(spectatorPlayer?.userId);

const currentPlayerState = match.playerStates?.find((player) => {
  return String(getId(player.userId)) === String(viewUserId);
});

const otherPlayerStates = match.playerStates?.filter((player) => {
  const playerId = player.userId?._id || player.userId;
  return String(playerId) !== String(viewUserId);
}) ?? [];

const currentPlayerDice =
  match.roundRolls?.find(
    roll => String(roll.userId) === String(viewUserId)
  )?.dice ?? [];

if (match.roundPhase === "rolling") {
    return(
        <RollingPhase
          match={match}
          isPlayer={isPlayer}
          currentPlayerState={currentPlayerState}
          otherPlayerStates={otherPlayerStates}
          currentPlayerDice={currentPlayerDice}
        />
    )
  }

  if (match.roundPhase === "revealing") {
    return <RevealPhase />;
  }

  if (match.roundPhase === "betting") {
    return <BettingPhase isPlayer={isPlayer} />;
  }
}

function RollingPhase({ match, isPlayer, currentPlayerState, otherPlayerStates, currentPlayerDice }){
    return(
    <div className="ongoing-board">
      <header className="ongoing-board__header">
        <div className="ongoing-board__player score">
            <p>Stack: {currentPlayerState?.stack}</p>
        </div>
        <div className="ongoing-board__instructions">
          <h2>Round {match.currentRound}</h2>
          <p>Click the dice that you want to hold. Press ROLL to roll the dice you didn't hold. If you want to keep all five, click all of them and then STAND</p>
        </div>
        <div className="ongoing-board__player info">
            <h4>{currentPlayerState?.userId?.username ?? currentPlayerState?.username}</h4>
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
                {currentPlayerDice.map((die, index) => (
                    <Dice key={index} face={getDiceFace(die)} />
                ))}
          </div>

          <div className="ongoing-board__commands">
            {isPlayer && (
              <>
                <button id="stand-btn1">STAND</button>
                <button id="roll-btn1">ROLL</button>
                <p id="rem-rolls1">3 remaining rolls</p>
              </>
            )}
            <h4 className="timer">{match.category.timeControl}s</h4>
          </div>
        </div>
       </section>
      </div>
    </div>
    )
}

function BettingPhase({ isPlayer }){
  return(
    <div className="ongoing-board">
      <header className="ongoing-board__header">
        <div className="ongoing-board__instructions">
          <h2>Round 1</h2>
          <p>Instructions here</p>
        </div>
      </header>

      <div className="ongoing-board__content">
        <header className="ongoing-board__players">
        <div className="ongoing-board__player ongoing-board__player--one">
          <p>SCORE: 0</p>
          <h3>Player 1</h3>
          <p>Player status</p>
        </div>

      </header>
       <section className="ongoing-board__game">
        <div className="ongoing-board__side ongoing-board__side--p1">
          <div className="ongoing-board__commands">
            {isPlayer && (
              <div className="ongoing-board__betting">
                <button id="betting-plus">+</button>
                <p>500</p>
                <button id="betting-minus">-</button>
              </div>
            )}
            <p>Stack: ...</p>
            <p>Your dice: ...</p>
            <h4 id="timer">TIMER</h4>
          </div>
        </div>
       </section>
      </div>
    </div>
    )
}

function RevealPhase(){
    return(
    <div className="ongoing-board">
      <header className="ongoing-board__header">
        <div className="ongoing-board__instructions">
          <h2>Revealing</h2>
          <p>Dice revealed</p>
        </div>
      </header>

      <div className="ongoing-board__content">
        <header className="ongoing-board__players">
        <div className="ongoing-board__player ongoing-board__player--one">
          <div className="ongoing-board__dice-row">
            <Dice face="A" frozen={false} active={false} />
            <Dice face="A" frozen={false} active={false} />
            <Dice face="A" frozen={false} active={false} />
            <Dice face="A" frozen={false} active={false} />
            <Dice face="A" frozen={false} active={false} />
          </div>
        </div>
      </header>
       <section className="ongoing-board__game">
        <div className="ongoing-board__side ongoing-board__side--p1">
          <div className="ongoing-board__dice-row">
            <Dice face="A" frozen={false} active={false} />
            <Dice face="A" frozen={false} active={false} />
            <Dice face="A" frozen={false} active={false} />
            <Dice face="A" frozen={false} active={false} />
            <Dice face="A" frozen={false} active={false} />
          </div>
        </div>
       </section>
      </div>
    </div>
    )
}

export default OngoingBoard;
