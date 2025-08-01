import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
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
    isLoading,
    logout,
  };
}