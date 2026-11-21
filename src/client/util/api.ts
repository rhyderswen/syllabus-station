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

export function courseSearchQuery(query: string) {
  return queryOptions({
    queryKey: ["course", "search", query],

    queryFn: async ({ signal }) => {
      const response = await authFetch(`/course/search?query=${encodeURIComponent(query)}`, {
        signal,
      });

      const data: { courses: Course[] } = await response.json();

      return data.courses;
    },

    staleTime: 30 * 1000,
  });
}

export function instructorSearchQuery(catalogCode: string) {
  return queryOptions({
    queryKey: ["course", "instructors", catalogCode],

    queryFn: async ({ signal }) => {
      const response = await authFetch(
        `/course/listInstructors?catalogCode=${encodeURIComponent(catalogCode)}`,
        {
          signal,
        },
      );

      const data: { instructors: { professor: string }[] } = await response.json();

      return data.instructors.map(({ professor }) => ({
        value: professor,
        label: professor,
      }));
    },

    staleTime: 5 * 60 * 1000,
  });
}

export function courseByCatalogCodeQuery(catalogCode: string) {
  return queryOptions({
    queryKey: ["course", "catalogCode", catalogCode],

    queryFn: async () => {
      const response = await authFetch(
        `/course/catalogCode?courseID=${encodeURIComponent(catalogCode)}`,
        {
          method: "GET",
        },
      );

      const data: { courses: Course[] } = await response.json();

      return data.courses;
    },

    staleTime: 0,
  });
}
