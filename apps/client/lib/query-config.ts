import { QueryClient } from "@tanstack/react-query";

export const queryClientOptions = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
};

// Singleton for non-component usage (if needed)
export const queryClient = new QueryClient(queryClientOptions);
