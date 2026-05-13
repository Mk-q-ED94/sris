import { createContext, useContext, useMemo, useState } from "react";
import { clearStoredToken, getStoredToken, setStoredToken } from "../lib/api";

type AuthContextValue = {
  token: string;
  isAuthed: boolean;
  saveToken: (token: string) => void;
  clearToken: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState(() => getStoredToken());

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthed: token.length > 0,
      saveToken(nextToken) {
        setStoredToken(nextToken);
        setToken(nextToken);
      },
      clearToken() {
        clearStoredToken();
        setToken("");
      },
    }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
