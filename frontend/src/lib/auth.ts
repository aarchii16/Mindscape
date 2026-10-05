// Simple auth utilities for frontend
// - Reads JWT and refresh token from localStorage (as set in AuthPage)
// - Provides helpers to get current user (from cached localStorage user or by calling /api/auth/me)

export type AuthUser = {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: string;
};

const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:8000"; // Node backend default

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refreshToken");
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export function getCachedUser(): AuthUser | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function fetchMe(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const user: AuthUser | null = data?.user || null;
    if (user) localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    const token = getToken();
    if (token) {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  } finally {
    clearAuth();
  }
}