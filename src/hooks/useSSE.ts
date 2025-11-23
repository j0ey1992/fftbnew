import { useEffect, useRef } from 'react';
import sseClient, { SSEEventType, SSEEventHandler } from '@/lib/api/sse/client';

/**
 * Hook for subscribing to SSE events with automatic cleanup
 * @param eventType - SSE event type to subscribe to
 * @param handler - Event handler function
 * @param deps - Dependencies array for the effect
 */
export function useSSE<T = any>(
  eventType: SSEEventType,
  handler: SSEEventHandler<T>,
  deps: React.DependencyList = []
) {
  const handlerRef = useRef(handler);
  
  // Update handler ref when it changes
  useEffect(() => {
    handlerRef.current = handler;
  });
  
  useEffect(() => {
    // Create a stable handler that calls the current handler
    const stableHandler: SSEEventHandler<T> = (event) => {
      handlerRef.current(event);
    };
    
    // Subscribe to the event
    const unsubscribe = sseClient.subscribe(eventType, stableHandler);
    
    // Cleanup on unmount or when dependencies change
    return () => {
      unsubscribe();
    };
  }, [eventType, ...deps]);
}

/**
 * Hook for subscribing to multiple SSE events with automatic cleanup
 * @param eventTypes - Array of SSE event types to subscribe to
 * @param handler - Event handler function
 * @param deps - Dependencies array for the effect
 */
export function useSSEMultiple<T = any>(
  eventTypes: SSEEventType[],
  handler: SSEEventHandler<T>,
  deps: React.DependencyList = []
) {
  const handlerRef = useRef(handler);
  
  // Update handler ref when it changes
  useEffect(() => {
    handlerRef.current = handler;
  });
  
  useEffect(() => {
    // Create a stable handler that calls the current handler
    const stableHandler: SSEEventHandler<T> = (event) => {
      handlerRef.current(event);
    };
    
    // Subscribe to all events
    const unsubscribe = sseClient.subscribeToMany(eventTypes, stableHandler);
    
    // Cleanup on unmount or when dependencies change
    return () => {
      unsubscribe();
    };
  }, [JSON.stringify(eventTypes), ...deps]);
}

/**
 * Hook for managing SSE connection lifecycle
 * @param autoConnect - Whether to automatically connect on mount
 */
export function useSSEConnection(autoConnect: boolean = true) {
  useEffect(() => {
    if (autoConnect && !sseClient.isConnected()) {
      sseClient.connect().catch(error => {
        console.error('Failed to connect to SSE:', error);
      });
    }
    
    // Note: We don't disconnect on unmount because SSE client is shared
    // across the entire app. Connection is managed at app level.
  }, [autoConnect]);
  
  return {
    isConnected: sseClient.isConnected(),
    connect: () => sseClient.connect(),
    disconnect: () => sseClient.disconnect()
  };
}