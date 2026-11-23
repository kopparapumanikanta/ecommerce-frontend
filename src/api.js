const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export class SessionExpiredError extends Error {}

export async function request(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 401 && token) {
    throw new SessionExpiredError('Session expired, please sign in again');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const details = data?.fieldErrors ? Object.values(data.fieldErrors).join(', ') : '';
    throw new Error([data?.message || 'Request failed', details].filter(Boolean).join(': '));
  }
  return data;
}

export function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
