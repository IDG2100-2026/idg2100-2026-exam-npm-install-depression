import "./Dice.css";

function Dice({ face = "A", frozen = false, active = false }) {
  return (
    <div
      className={`die 
        ${frozen ? "die--frozen" : "die--unfrozen"} 
        ${active ? "die--active" : "die--inactive"}
      `}
    >
      <p className="die__face">{face}</p>
    </div>
  );
}

export default Dice;