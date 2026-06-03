import WaitingBoard from "./WaitingBoard";
import OngoingBoard from "./OngoingBoard";
import FinishedBoard from "./FinishedBoard";

function GameBoard({ match, isPlayer, currentUserId, myDice, myHeld, onHoldDie, onHoldDice, onReroll, onBet, onFold, timeLeft, allRolls }) {
  if (match.status === "waiting") {
    return <WaitingBoard match={match} isPlayer={isPlayer} currentUserId={currentUserId} />;
  }

  if (match.status === "ongoing") {
    return (
      <OngoingBoard
        match={match}
        isPlayer={isPlayer}
        currentUserId={currentUserId}
        myDice={myDice}
        myHeld={myHeld}
        onHoldDie={onHoldDie}
        onHoldDice={onHoldDice}
        onReroll={onReroll}
        onBet={onBet}
        onFold={onFold}
        timeLeft={timeLeft}
        allRolls={allRolls}
      />
    );
  }

  if (match.status === "completed") {
    return <FinishedBoard match={match} isPlayer={isPlayer} currentUserId={currentUserId} />;
  }

  return <p>Unknown match status.</p>;
}

export default GameBoard;
