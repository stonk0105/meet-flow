"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "meetflow-auth";

export type User = {
  email: string;
  name: string;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as User;
    return data?.email ? data : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, _password: string) => {
    const trimmed = email.trim();
    if (!trimmed) return false;
    const name = trimmed.split("@")[0] || trimmed;
    const userData: User = { email: trimmed, name };
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
