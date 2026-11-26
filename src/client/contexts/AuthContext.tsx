import { ApiError, authFetch } from "@/util/api";
import { useQuery } from "@tanstack/react-query";
import { createContext, ReactNode, useCallback, useContext, useMemo } from "react";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

interface AuthContextValue {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  status: AuthStatus;
  checkAuth: () => Promise<void>;
}

interface UserPermissions {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isBanned: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    data: userPermissions,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["auth"],
    queryFn: async (): Promise<UserPermissions> => {
      try {
        const resp = await authFetch("/auth/checkAuth", { method: "GET" });
        const json = await resp.json();
        return {
          isAuthenticated: resp.ok,
          isAdmin: json.isAdmin || false,
          isBanned: json.isBanned || false,
        };
      } catch (error) {
        // 401 is not logged in, not an error
        if (error instanceof ApiError && error.status === 401)
          return { isAuthenticated: false, isAdmin: false, isBanned: false };
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
      : userPermissions?.isAuthenticated
        ? "authenticated"
        : "unauthenticated";

  const checkAuth = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value = useMemo(
    () => ({
      isAuthenticated: userPermissions?.isAuthenticated || false,
      isAdmin: userPermissions?.isAdmin || false,
      isBanned: userPermissions?.isBanned || false,
      status,
      checkAuth,
    }),
    [userPermissions, status, checkAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
