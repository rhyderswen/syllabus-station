import { ApiError, authFetch } from "@/util/api";
import { useQuery } from "@tanstack/react-query";
import { createContext, ReactNode, useCallback, useContext, useMemo } from "react";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

interface AuthContextValue {
  isAuthenticated: boolean;
  status: AuthStatus;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    data: isAuth,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      try {
        await authFetch("/auth/checkAuth", { method: "GET" });
        return true;
      } catch (error) {
        // 401 is not logged in, not an error
        if (error instanceof ApiError && error.status === 401) return false;
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const status: AuthStatus = isPending
    ? "loading"
    : isError
      ? "error"
      : isAuth
        ? "authenticated"
        : "unauthenticated";

  const checkAuth = useCallback(async () => {
    await refetch();
  }, [refetch]);

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
