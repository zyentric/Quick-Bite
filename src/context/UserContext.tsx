import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '../utils/storage';
import { registerLogout } from '../utils/authFetch';
import { API_URL } from '../config/api';

export type UserRole = 'customer' | 'shopkeeper' | 'delivery_man' | 'admin';

interface UserContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userId: string | null;
  setUserId: (id: string | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  checkingAuth: boolean;
  /** Save both tokens to storage and update auth state. Called after login/register. */
  saveTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  /** Force-logout: clear all tokens and reset auth state. */
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('customer');
  const [userId, setUserIdState] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticatedState] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setIsAuthenticatedState(false);
    setUserIdState(null);
    setRoleState('customer');
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('userId');
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  }, []);

  // ── Silent refresh ────────────────────────────────────────────────────────
  /**
   * Try to get a fresh access token using the stored refresh token.
   * Returns true if successful, false if the refresh token is also invalid/expired.
   */
  const silentRefresh = useCallback(async (): Promise<boolean> => {
    const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
    if (!storedRefreshToken) return false;

    try {
      const res = await fetch(`${API_URL}/users/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      if (data.accessToken) {
        await AsyncStorage.setItem('userToken', data.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // ── App startup: restore session ──────────────────────────────────────────
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedRole = await AsyncStorage.getItem('userRole');
        const storedToken = await AsyncStorage.getItem('userToken');

        // Need all three pieces to restore a session
        if (!storedToken || !storedUserId || !storedRole) {
          return; // Stay logged out
        }

        // Validate the stored access token by attempting a silent refresh.
        // This ensures the session is genuinely valid, not just present in storage.
        const refreshed = await silentRefresh();
        if (!refreshed) {
          // Both access and refresh tokens are invalid/expired — force logout
          await logout();
          return;
        }

        // Session is valid — restore state
        setRoleState(storedRole as UserRole);
        setUserIdState(storedUserId);
        setIsAuthenticatedState(true);
      } catch (error) {
        console.error('Failed to load session:', error);
      } finally {
        setCheckingAuth(false);
      }
    };

    loadSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Register logout with authFetch so 401s can auto-logout ────────────────
  useEffect(() => {
    registerLogout(logout);
  }, [logout]);

  // ── Setters ───────────────────────────────────────────────────────────────
  const setRole = async (newRole: UserRole) => {
    setRoleState(newRole);
    try {
      await AsyncStorage.setItem('userRole', newRole);
    } catch (e) {
      console.error(e);
    }
  };

  const setUserId = async (id: string | null) => {
    setUserIdState(id);
    try {
      if (id) {
        await AsyncStorage.setItem('userId', id);
      } else {
        await AsyncStorage.removeItem('userId');
      }
    } catch (e) {
      console.error(e);
    }
  };

  /** Legacy setter — use `logout()` to log out, use `saveTokens()` to log in. */
  const setIsAuthenticated = async (auth: boolean) => {
    if (!auth) {
      await logout();
    } else {
      setIsAuthenticatedState(true);
    }
  };

  /** Called after a successful login/register to persist both tokens. */
  const saveTokens = async (accessToken: string, refreshToken: string) => {
    await AsyncStorage.setItem('userToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    setIsAuthenticatedState(true);
  };

  return (
    <UserContext.Provider
      value={{
        role,
        setRole,
        userId,
        setUserId,
        isAuthenticated,
        setIsAuthenticated,
        checkingAuth,
        saveTokens,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
