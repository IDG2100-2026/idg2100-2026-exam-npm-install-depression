import { apiFetch } from './apiClient';

export async function getTournaments(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const res = await apiFetch(`/tournaments${params ? `?${params}` : ''}`);
    const data = await res.json();
    return data;
}

export async function getUpcomingTournaments() {
    const res = await apiFetch('/tournaments/upcoming');
    return res.json();
}

export async function getTournamentById(id) {
    const res = await apiFetch(`/tournaments/${id}`);
    return res.json();
}

export async function joinTournament(id) {
    const res = await apiFetch(`/tournaments/${id}/participants`, { method: 'POST' });
    return res.json();
}

export async function leaveTournament(id) {
    const res = await apiFetch(`/tournaments/${id}/participants/me`, { method: 'DELETE' });
    return res.json();
}

export async function addTournamentComment(tournamentId, text) {
    const res = await apiFetch(`/tournaments/${tournamentId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text })
    });
    return res.json();
}
