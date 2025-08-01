
import { useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';

export function usePrefetch() {
  useEffect(() => {
    // Prefetch critical data
    const prefetchData = async () => {
      try {
        // Prefetch posts
        queryClient.prefetchQuery({
          queryKey: ['/api/posts'],
          staleTime: 5 * 60 * 1000,
        });

        // Prefetch communities
        queryClient.prefetchQuery({
          queryKey: ['/api/communities'],
          staleTime: 10 * 60 * 1000,
        });

        // Prefetch user data if authenticated
        const user = await queryClient.getQueryData(['/api/user']);
        if (user) {
          queryClient.prefetchQuery({
            queryKey: ['/api/user/stats'],
            staleTime: 5 * 60 * 1000,
          });
        }
      } catch (error) {
        console.log('Prefetch failed:', error);
      }
    };

    // Prefetch after a short delay to avoid blocking initial render
    const timer = setTimeout(prefetchData, 100);
    
    return () => clearTimeout(timer);
  }, []);
}
