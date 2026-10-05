// Lightweight API helper with automatic JWT refresh and retry
// - Uses localStorage token/refreshToken set by AuthPage
// - On 401, tries refresh-token once and retries the original request

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

function setTokenPair(token: string, refreshToken?: string) {
  if (token) localStorage.setItem('token', token);
  if (typeof refreshToken === 'string') localStorage.setItem('refreshToken', refreshToken);
}

async function tryRefresh(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) {
    clearAuth();
    return false;
  }
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt })
    });
    if (!res.ok) {
      clearAuth();
      return false;
    }
    const data = await res.json().catch(() => null);
    if (!data?.token) {
      clearAuth();
      return false;
    }
    setTokenPair(data.token, data.refreshToken);
    return true;
  } catch {
    clearAuth();
    return false;
  }
}

export type FetchOptions = RequestInit & { skipAuth?: boolean };

export async function fetchWithAuth(input: RequestInfo | URL, init: FetchOptions = {}) {
  const { skipAuth, headers, ...rest } = init;
  const token = getToken();
  const authHeaders: HeadersInit = {
    ...(headers as any),
    ...(skipAuth ? {} : token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res = await fetch(input, { ...rest, headers: authHeaders });

  if (res.status === 401 && !skipAuth) {
    const refreshed = await tryRefresh();
    if (!refreshed) return res; // caller can redirect to /auth
    const newToken = getToken();
    const retryHeaders: HeadersInit = {
      ...(headers as any),
      ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
    };
    res = await fetch(input, { ...rest, headers: retryHeaders });
  }

  return res;
}

export { API_BASE }; 