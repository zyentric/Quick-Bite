/**
 * authFetch — A drop-in replacement for `fetch` that handles auth automatically.
 *
 * What it does:
 * 1. Attaches `Authorization: Bearer <accessToken>` to every request.
 * 2. On a 401 response, calls POST /api/users/refresh with the stored refresh token.
 * 3. Saves the new access token and retries the original request once.
 * 4. If the refresh also fails (refresh token expired/invalid), triggers a full logout.
 */

import safeStorage from './storage';
import { API_URL } from '../config/api';

type LogoutFn = () => void;

let _logoutCallback: LogoutFn | null = null;

/** Register the logout function from UserContext so authFetch can trigger it. */
export function registerLogout(fn: LogoutFn) {
  _logoutCallback = fn;
}

async function getAccessToken(): Promise<string | null> {
  return safeStorage.getItem('userToken');
}

async function getRefreshToken(): Promise<string | null> {
  return safeStorage.getItem('refreshToken');
}

async function saveAccessToken(token: string): Promise<void> {
  await safeStorage.setItem('userToken', token);
}

/**
 * Attempt to get a new access token using the stored refresh token.
 * Returns the new access token, or null if the refresh failed.
 */
async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/users/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.accessToken) {
      await saveAccessToken(data.accessToken);
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * authFetch — Use this instead of raw `fetch` for any API call that requires auth.
 *
 * @example
 *   const res = await authFetch(`${API_URL}/users/profile`);
 *   const data = await res.json();
 */
export async function authFetch(
  url: RequestInfo,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = await getAccessToken();

  // Build headers with the Bearer token
  const headers = new Headers(options.headers as HeadersInit_ | undefined);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const firstResponse = await fetch(url, { ...options, headers });

  // If not a 401, return the response as-is
  if (firstResponse.status !== 401) {
    return firstResponse;
  }

  // Got a 401 — try to refresh the access token silently
  const newAccessToken = await tryRefreshToken();

  if (!newAccessToken) {
    // Refresh failed — log the user out
    if (_logoutCallback) {
      _logoutCallback();
    }
    return firstResponse; // return the original 401 so callers can handle it
  }

  // Retry the original request with the new token
  const retryHeaders = new Headers(options.headers as HeadersInit_ | undefined);
  retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);
  return fetch(url, { ...options, headers: retryHeaders });
}
