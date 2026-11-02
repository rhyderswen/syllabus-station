import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  isAuthenticated: boolean;
  status: AuthStatus;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("unauthenticated");

  const checkAuth = useCallback(async () => {
    setStatus("loading");

    try {
      const response = await fetch("/checkAuth", {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        setStatus("unauthenticated");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to check authentication");
      }

      setStatus("authenticated");
    } catch (error) {
      console.error("Error checking authentication:", error);
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const value = useMemo(
    () => ({
      isAuthenticated: status === "authenticated",
      status,
      checkAuth,
    }),
    [status, checkAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
