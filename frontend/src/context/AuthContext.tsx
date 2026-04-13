/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getProfile } from '../api/endpoints';
import type { AuthRole, AuthSession } from '../types/auth';
import {
  getStoredAuthSession,
  setStoredAuthSession,
  clearStoredAuthSession,
} from '../utils/auth';

interface AuthContextType {
  token: string | null;
  expiresAt: string | null;
  userId: number | null;
  session: AuthSession | null;
  role: AuthRole | null;
  username: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredAuthSession());
  const [isInitializing, setIsInitializing] = useState(() => {
    const storedSession = getStoredAuthSession();
    return Boolean(
      storedSession?.token &&
        (!storedSession.userId || !storedSession.username || !storedSession.role),
    );
  });

  useEffect(() => {
    if (!session?.token) {
      setIsInitializing(false);
      return;
    }

    if (session.userId && session.username && session.role) {
      setIsInitializing(false);
      return;
    }

    let active = true;

    getProfile({ skipAuthRedirect: true })
      .then((profile) => {
        if (!active) {
          return;
        }

        const restoredSession: AuthSession = {
          token: session.token,
          expiresAt: session.expiresAt ?? null,
          userId: profile.userId,
          username: profile.username,
          role: profile.role,
        };

        setSession(restoredSession);
        setStoredAuthSession(restoredSession);
      })
      .catch(() => {
        if (!active) {
          return;
        }
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
    setStoredAuthSession(nextSession);
  };

  const logout = () => {
    setSession(null);
    clearStoredAuthSession();
  };

  const value = {
    token: session?.token ?? null,
    expiresAt: session?.expiresAt ?? null,
    userId: session?.userId ?? null,
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
