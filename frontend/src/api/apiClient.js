const BASE = 'http://localhost:4567/api';

export async function apiFetch(path, options = {}) {
    const token = localStorage.getItem('accessToken');

    const isFormData = options.body instanceof FormData;

    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: {
            // Don't set Content-Type for FormData — browser sets it with the boundary automatically
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        }
    });

    if (res.status === 401) {
      const hadToken = !!localStorage.getItem('accessToken');
    
      if (hadToken) {
        const refreshed = await tryRefresh();
    
        if (refreshed) {
          return apiFetch(path, options);
        }
      }
    
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
    
      window.dispatchEvent(new Event('authChanged'));
    
      throw new Error('Unauthorized');
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
