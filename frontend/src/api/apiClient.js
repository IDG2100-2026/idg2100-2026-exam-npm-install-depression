const BASE = 'http://localhost:4567/api';

export async function apiFetch(path, options = {}) {
    const token = localStorage.getItem('accessToken');

    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        }
    });

    if (res.status === 401) {
        const refreshed = await tryRefresh();
        if (refreshed) {
            return apiFetch(path, options);
        } else {
            localStorage.clear();
            window.location.href = '/login';
        }
    }

    return res;
}

async function tryRefresh() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
        const res = await fetch(`${BASE}/users/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });
        if (!res.ok) return false;
        const { accessToken } = await res.json();
        localStorage.setItem('accessToken', accessToken);
        return true;
    } catch {
        return false;
    }
}
