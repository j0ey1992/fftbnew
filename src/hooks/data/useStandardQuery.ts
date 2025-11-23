/**
 * Standard Query Hook - Base hook for consistent data fetching
 * 
 * This hook provides a standardized interface for all data queries
 * using React Query with sensible defaults and consistent naming.
 */

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey
} from '@tanstack/react-query';

// Default query options
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Standard query hook with consistent defaults
 */
export function useStandardQuery<TData = unknown, TError = Error>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  const result = useQuery<TData, TError>({
    queryKey,
    queryFn,
    staleTime: DEFAULT_STALE_TIME,
    cacheTime: DEFAULT_CACHE_TIME,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options
  });

  return {
    data: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    isRefetching: result.isRefetching,
    refetch: result.refetch,
    isSuccess: result.isSuccess,
    isFetching: result.isFetching,
    status: result.status
  };
}

/**
 * Standard mutation hook with consistent defaults
 */
export function useStandardMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables, TContext>
) {
  const result = useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    retry: 1,
    ...options
  });

  return {
    mutate: result.mutate,
    mutateAsync: result.mutateAsync,
    isPending: result.isPending,
    isError: result.isError,
    error: result.error,
    isSuccess: result.isSuccess,
    data: result.data,
    reset: result.reset,
    status: result.status
  };
}

/**
 * Invalidate queries helper
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  
  return {
    invalidate: (queryKey: QueryKey) => queryClient.invalidateQueries({ queryKey }),
    invalidateAll: () => queryClient.invalidateQueries(),
    refetchQueries: (queryKey: QueryKey) => queryClient.refetchQueries({ queryKey }),
    resetQueries: (queryKey: QueryKey) => queryClient.resetQueries({ queryKey })
  };
}

/**
 * Optimistic update helper
 */
export function useOptimisticUpdate<TData = unknown>(queryKey: QueryKey) {
  const queryClient = useQueryClient();
  
  return {
    setOptimisticData: (updater: (oldData: TData | undefined) => TData) => {
      queryClient.setQueryData<TData>(queryKey, updater);
    },
    
    getOptimisticData: () => {
      return queryClient.getQueryData<TData>(queryKey);
    },
    
    cancelQueries: () => {
      return queryClient.cancelQueries({ queryKey });
    }
  };
}

/**
 * Prefetch helper for hover/predictive loading
 */
export function usePrefetch() {
  const queryClient = useQueryClient();
  
  return {
    prefetchQuery: <TData = unknown>(
      queryKey: QueryKey,
      queryFn: () => Promise<TData>,
      staleTime: number = DEFAULT_STALE_TIME
    ) => {
      return queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime
      });
    }
  };
}