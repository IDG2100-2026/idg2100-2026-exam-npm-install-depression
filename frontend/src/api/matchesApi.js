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

export async function joinMatch(matchId, userId) {
  const response = await fetch(
    `http://localhost:4567/api/matches/${matchId}/players`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    }
  );

  const data = await response.json();

  return data;
}

//FINAL CREATE MATCH WITH TOKEN
// export async function createMatch(matchData, token) {
//   const response = await fetch("http://localhost:4567/api/matches", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify(matchData),
//   });

//   const data = await response.json();

//   return data;
// }


//CREATE MATCH FOR TESTING
export async function createMatch(matchData) {
  const response = await fetch("http://localhost:4567/api/matches", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(matchData),
  });

  const data = await response.json();

  return data;
}