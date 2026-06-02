import WaitingBoard from "./WaitingBoard";
import OngoingBoard from "./OngoingBoard";
import FinishedBoard from "./FinishedBoard";

function GameBoard({ match, isPlayer, currentUserId }){
     if (match.status === "waiting") {
    return <WaitingBoard match={match} isPlayer={isPlayer} currentUserId={currentUserId} />;
  }

  if (match.status === "ongoing") {
    return <OngoingBoard match={match} isPlayer={isPlayer} currentUserId={currentUserId}/>;
  }

  if (match.status === "completed") {
    return <FinishedBoard match={match} isPlayer={isPlayer} currentUserId={currentUserId} />;
  }

  return <p>Unknown match status.</p>;

}

export default GameBoard;