

import { apiFetch } from './apiClient';

export async function getPlatformActivity() {
  const res = await apiFetch('/stats');
  return res.json();
}