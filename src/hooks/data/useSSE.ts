/**
 * SSE Hook - Memory-safe Server-Sent Events management
 * 
 * This hook provides a safe way to use SSE connections in React components
 * with automatic cleanup to prevent memory leaks.
 */

import { useEffect, useCallback, useRef } from 'react';
import { sseClient, SSEEventType, SSEEventHandler } from '@/lib/api/sse/client';
import { useCleanup, useSubscriptions } from '../utils/useCleanup';

interface UseSSEOptions {
  autoConnect?: boolean;
  reconnectOnError?: boolean;
}

/**
 * Hook for managing SSE connections with automatic cleanup
 */
export function useSSE(options: UseSSEOptions = {}) {
  const { autoConnect = true, reconnectOnError = true } = options;
  const { registerCleanup, checkMounted } = useCleanup();
  const { subscribe: trackSubscription } = useSubscriptions();
  const connectionRef = useRef<boolean>(false);

  // Connect to SSE
  const connect = useCallback(async () => {
    if (!checkMounted() || connectionRef.current) return;
    
    try {
      connectionRef.current = true;
      await sseClient.connect();
    } catch (error) {
      console.error('Failed to connect to SSE:', error);
      connectionRef.current = false;
      
      if (reconnectOnError && checkMounted()) {
        // Retry after a delay
        const timeout = setTimeout(() => {
          if (checkMounted()) {
            connect();
          }
        }, 5000);
        
        registerCleanup(() => clearTimeout(timeout));
      }
    }
  }, [checkMounted, reconnectOnError, registerCleanup]);

  // Disconnect from SSE
  const disconnect = useCallback(() => {
    connectionRef.current = false;
    sseClient.disconnect();
  }, []);

  // Subscribe to an event with automatic cleanup
  const subscribeToEvent = useCallback(<T = any>(
    eventType: SSEEventType,
    handler: SSEEventHandler<T>
  ) => {
    // Wrap handler to check if component is still mounted
    const safeHandler: SSEEventHandler<T> = (event) => {
      if (checkMounted()) {
        handler(event);
      }
    };
    
    // Subscribe and track for cleanup
    const unsubscribe = sseClient.subscribe(eventType, safeHandler);
    const cleanup = trackSubscription(unsubscribe);
    
    return cleanup;
  }, [checkMounted, trackSubscription]);

  // Subscribe to multiple events
  const subscribeToEvents = useCallback(<T = any>(
    eventTypes: SSEEventType[],
    handler: SSEEventHandler<T>
  ) => {
    // Wrap handler to check if component is still mounted
    const safeHandler: SSEEventHandler<T> = (event) => {
      if (checkMounted()) {
        handler(event);
      }
    };
    
    // Subscribe and track for cleanup
    const unsubscribe = sseClient.subscribeToMany(eventTypes, safeHandler);
    const cleanup = trackSubscription(unsubscribe);
    
    return cleanup;
  }, [checkMounted, trackSubscription]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    // Ensure disconnection on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    connect,
    disconnect,
    subscribe: subscribeToEvent,
    subscribeToMany: subscribeToEvents,
    isConnected: sseClient.isConnected()
  };
}

/**
 * Hook for subscribing to specific SSE events
 */
export function useSSEEvent<T = any>(
  eventType: SSEEventType,
  handler: SSEEventHandler<T>,
  options: UseSSEOptions = {}
) {
  const { subscribe } = useSSE(options);
  
  useEffect(() => {
    return subscribe(eventType, handler);
  }, [eventType, handler, subscribe]);
}

/**
 * Hook for subscribing to multiple SSE events
 */
export function useSSEEvents<T = any>(
  eventTypes: SSEEventType[],
  handler: SSEEventHandler<T>,
  options: UseSSEOptions = {}
) {
  const { subscribeToMany } = useSSE(options);
  
  useEffect(() => {
    return subscribeToMany(eventTypes, handler);
  }, [eventTypes, handler, subscribeToMany]);
}
