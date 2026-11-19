import { QueryClient, queryOptions } from "@tanstack/react-query";
import { CourseData, Course } from "~/types";

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

export function courseQuery(courseCode: string) {
  return queryOptions({
    queryKey: ["course", courseCode],

    queryFn: async () => {
      const courseResponse = await authFetch(
        `/course/catalogCode?courseID=${encodeURIComponent(courseCode)}`,
        {
          method: "GET",
        },
      );

      if (!courseResponse.ok) {
        throw new Error("Failed to fetch course");
      }

      const courseData: { courses: Course[] } = await courseResponse.json();

      if (courseData.courses.length === 0) {
        return null;
      }

      const courseID = courseData.courses[0].id;

      const response = await authFetch(`/syllabus/list?courseID=${encodeURIComponent(courseID)}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch syllabi");
      }

      return (await response.json()) as CourseData;
    },

    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
