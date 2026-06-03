import { apiFetch } from './apiClient';

export async function getMatches(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const res = await apiFetch(`/matches${params ? `?${params}` : ''}`);
    const data = await res.json();
    return data.matches ?? [];
}

export async function getMatchById(matchId) {
    const res = await apiFetch(`/matches/${matchId}`);
    return res.json();
}

export async function getMatchState(matchId) {
    const res = await apiFetch(`/matches/${matchId}/state`);
    return res.json();
}


//   return data.matches;
// }

// export async function joinMatch(matchId, userId) {
//   const response = await fetch(
//     `http://localhost:4567/api/matches/${matchId}/players`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ userId }),
//     }
//   );

//   const data = await response.json();

//   return data;
// }

//FINAL CREATE MATCH WITH TOKEN
export async function createMatch(matchData) {
    const res = await apiFetch('/matches', {
        method: 'POST',
        body: JSON.stringify(matchData)
    });

    return res.json();
}


//CREATE MATCH FOR TESTING
// export async function createMatch(matchData) {
//   const response = await fetch("http://localhost:4567/api/matches", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(matchData),
//   });

//   const data = await response.json();

//   return data;
// }
// export async function createMatch(category) {
//     const res = await apiFetch('/matches', {
//         method: 'POST',
//         body: JSON.stringify({ category })
//     });
//     return res.json();
// }

export async function joinMatch(matchId) {
    const res = await apiFetch(`/matches/${matchId}/players`, {
        method: 'POST'
    });

    return res.json();
}

export async function leaveMatch(matchId) {
    const res = await apiFetch(`/matches/${matchId}/players/me`, { method: 'DELETE' });
    return res.json();
}

export async function addMatchComment(matchId, text) {
    const res = await apiFetch(`/matches/${matchId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text })
    });
    return res.json();
}

export async function deleteComment(commentId) {
    const res = await apiFetch(`/matches/comments/${commentId}`, { method: 'DELETE' });
    return res.json();
}

export async function getCurrentUser() {
    const res = await apiFetch('/users/me');
    return res.json();
}
