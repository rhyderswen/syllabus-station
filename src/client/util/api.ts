import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let refreshPromise: Promise<void> | null = null;

async function refreshSession(): Promise<void> {
  refreshPromise ??= fetch("/auth/refresh", {
    method: "GET",
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) throw new ApiError(res.status, "Session expired");
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const doFetch = () => fetch(input, { ...init, credentials: "include" });

  let res = await doFetch();

  if (res.status === 401) {
    try {
      await refreshSession();
    } catch {
      // Refresh failed
      throw new ApiError(401, "Session expired");
    }
    res = await doFetch(); // retry once
  }

  if (!res.ok) {
    throw new ApiError(res.status, (await res.text()) || res.statusText);
  }
  return res;
}
