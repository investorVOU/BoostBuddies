import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { isUnauthorizedError } from "./authUtils";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(`401: ${await res.text()}`);
    }
    throw new Error(`${res.status}: ${await res.text()}`);
  }
}

export async function apiRequest(endpoint: string, method: string = "GET", data?: any) {
  const url = endpoint.startsWith('http') ? endpoint : `${window.location.origin}${endpoint}`;

  // Ensure method is a valid HTTP method string
  const validMethod = typeof method === 'string' ? method.toUpperCase() : 'GET';

  const config: RequestInit = {
    method: validMethod,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Important for session cookies
  };

  if (data && validMethod !== "GET") {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Request failed" }));
      const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      throw error;
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return await response.text();
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
}

export function getAuthToken() {
  // This function is not needed for session-based auth
  // but we'll keep it to prevent the "getAuthToken is not defined" error
  return null;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnMount: false,
      refetchIntervalInBackground: false,
    },
    mutations: {
      retry: false,
    },
  },
});