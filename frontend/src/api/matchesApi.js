export async function getMatchById(matchId) {
  const response = await fetch(`http://localhost:4567/api/matches/${matchId}`);

  const data = await response.json();

  return data;
}

export async function getMatches() {
  const response = await fetch(`http://localhost:4567/api/matches`);

  const data = await response.json();

  return data.matches;
}