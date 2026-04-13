/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AUTH_SESSION_STORAGE_KEY, LEGACY_TOKEN_STORAGE_KEY } from '../constants/auth';
import { getProfile } from '../api/endpoints';
import { normalizeUserRole, type AuthSession, type UserRole } from '../types';

interface AuthContextType {
  token: string | null;
  session: AuthSession | null;
  role: UserRole | null;
  username: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredSession(): AuthSession | null {
  const serializedSession = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (!serializedSession) {
    return null;
  }

  try {
    const parsed = JSON.parse(serializedSession) as Partial<AuthSession>;

    if (
      typeof parsed.token === 'string' &&
      typeof parsed.userId === 'number' &&
      typeof parsed.username === 'string' &&
      typeof parsed.role === 'string'
    ) {
      return {
        token: parsed.token,
        userId: parsed.userId,
        username: parsed.username,
        role: normalizeUserRole(parsed.role),
      };
    }
  } catch {
    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  }

  return null;
}

function persistSession(session: AuthSession | null) {
  if (session) {
    localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  }

  localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const [isInitializing, setIsInitializing] = useState(
    () => readStoredSession() === null && !!localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY),
  );

  useEffect(() => {
    if (session) {
      return undefined;
    }

    const legacyToken = localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY);
    if (!legacyToken) {
      return undefined;
    }

    let active = true;

    getProfile()
      .then((profile) => {
        if (!active) {
          return;
        }

        const restoredSession: AuthSession = {
          token: legacyToken,
          userId: profile.userId,
          username: profile.username,
          role: profile.role,
        };

        setSession(restoredSession);
        persistSession(restoredSession);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        persistSession(null);
      })
      .finally(() => {
        if (active) {
          setIsInitializing(false);
        }
      });

    return () => {
      active = false;
    };
  }, [session]);

  const login = (nextSession: AuthSession) => {
    setSession(nextSession);
    persistSession(nextSession);
  };

  const logout = () => {
    setSession(null);
    persistSession(null);
  };

  const value = {
    token: session?.token ?? null,
    session,
    role: session?.role ?? null,
    username: session?.username ?? null,
    isAuthenticated: !!session?.token,
    isInitializing,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
