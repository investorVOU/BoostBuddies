import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    // Remove loading screen by making this query faster and non-blocking
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = () => {
    // Clear any local storage/session storage
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to landing page
    window.location.href = "/";
  };

  return {
    user,
    isAuthenticated: !!user && !error,
    isLoading, // Return actual loading state for proper auth flow
    logout,
  };
}