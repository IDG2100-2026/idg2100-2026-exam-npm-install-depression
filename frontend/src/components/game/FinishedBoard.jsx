
function FinishedBoard({ match }){
    const players = match.players ?? [];

    
    return(
        <div className="ongoing-board">

          <div className="ongoing-board__content">
            <header className="ongoing-board__players">
            {players.map((player)=> (
                <div className="ongoing-board__player" key="player._id">
                    <h3>{player.username}</h3>
                    <p>{player.stack}</p>
                </div>
              )
              )

              }

          </header>
           <section className="ongoing-board__game">
            <div className="ongoing-board__side ongoing-board__side--p1">
                <h2>Player 2</h2>
                <p>is the winner</p>
                <p>Stack:</p>
            </div>
           </section>
          </div>
        </div>
        )
}

export default FinishedBoard;