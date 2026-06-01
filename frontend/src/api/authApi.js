import { apiFetch } from './apiClient';

const BASE = 'http://localhost:4567/api';

export async function login(username, password) {
    const res = await fetch(`${BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('userId', data.user.id);
    localStorage.setItem('username', data.user.username);
    localStorage.setItem('role', data.user.role);

    return data.user;
}

export async function register(username, email, password, age) {
    const res = await fetch(`${BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, age })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
}

export async function logout() {
    await apiFetch('/users/logout', { method: 'POST' }).catch(() => {});
    localStorage.clear();
}

export async function getUserProfile(userId) {
    const res = await apiFetch(`/users/${userId}`);
    return res.json();
}

export async function updateProfile(userId, updates) {
    const res = await apiFetch(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
    });
    return res.json();
}

export async function getPlatformActivity() {
    const res = await fetch(`${BASE}/stats`);
    return res.json();
}

export function getCurrentUser() {
    const id = localStorage.getItem('userId');
    if (!id) return null;
    return {
        id,
        username: localStorage.getItem('username'),
        role: localStorage.getItem('role')
    };
}

export function isLoggedIn() {
    return !!localStorage.getItem('accessToken');
}

export function isAdmin() {
    return localStorage.getItem('role') === 'admin';
}
