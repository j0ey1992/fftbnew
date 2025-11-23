/**
 * Cleanup utilities for preventing memory leaks in React hooks
 * 
 * These utilities help ensure proper cleanup of subscriptions,
 * timers, and event listeners to prevent memory leaks.
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Track cleanup functions and ensure they're called on unmount
 */
export function useCleanup() {
  const cleanupFunctions = useRef<Set<() => void>>(new Set());
  const isMounted = useRef(true);

  // Register a cleanup function
  const registerCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.add(cleanup);
    
    // Return a function to unregister this specific cleanup
    return () => {
      cleanupFunctions.current.delete(cleanup);
    };
  }, []);

  // Check if component is still mounted
  const checkMounted = useCallback(() => isMounted.current, []);

  // Run all cleanup functions
  const runCleanup = useCallback(() => {
    cleanupFunctions.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });
    cleanupFunctions.current.clear();
  }, []);

  // Ensure cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      runCleanup();
    };
  }, [runCleanup]);

  return {
    registerCleanup,
    checkMounted,
    runCleanup,
    isMounted: checkMounted
  };
}

/**
 * Safely set timeouts that are automatically cleared on unmount
 */
export function useSafeTimeout() {
  const timeouts = useRef<Set<NodeJS.Timeout>>(new Set());

  const setTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = global.setTimeout(() => {
      timeouts.current.delete(timeout);
      callback();
    }, delay);
    
    timeouts.current.add(timeout);
    
    return () => {
      global.clearTimeout(timeout);
      timeouts.current.delete(timeout);
    };
  }, []);

  // Clear all timeouts
  const clearAll = useCallback(() => {
    timeouts.current.forEach(timeout => global.clearTimeout(timeout));
    timeouts.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return clearAll;
  }, [clearAll]);

  return { setTimeout, clearAll };
}

/**
 * Safely set intervals that are automatically cleared on unmount
 */
export function useSafeInterval() {
  const intervals = useRef<Set<NodeJS.Timeout>>(new Set());

  const setInterval = useCallback((callback: () => void, delay: number) => {
    const interval = global.setInterval(callback, delay);
    intervals.current.add(interval);
    
    return () => {
      global.clearInterval(interval);
      intervals.current.delete(interval);
    };
  }, []);

  // Clear all intervals
  const clearAll = useCallback(() => {
    intervals.current.forEach(interval => global.clearInterval(interval));
    intervals.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return clearAll;
  }, [clearAll]);

  return { setInterval, clearAll };
}

/**
 * Safely add event listeners that are automatically removed on unmount
 */
export function useSafeEventListener() {
  const listeners = useRef<Array<{
    target: EventTarget;
    type: string;
    listener: EventListener;
    options?: boolean | AddEventListenerOptions;
  }>>([]);

  const addEventListener = useCallback((
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    target.addEventListener(type, listener, options);
    
    const entry = { target, type, listener, options };
    listeners.current.push(entry);
    
    return () => {
      target.removeEventListener(type, listener, options);
      const index = listeners.current.indexOf(entry);
      if (index > -1) {
        listeners.current.splice(index, 1);
      }
    };
  }, []);

  // Remove all listeners
  const removeAll = useCallback(() => {
    listeners.current.forEach(({ target, type, listener, options }) => {
      target.removeEventListener(type, listener, options);
    });
    listeners.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return removeAll;
  }, [removeAll]);

  return { addEventListener, removeAll };
}

/**
 * Create an AbortController that's automatically aborted on unmount
 */
export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  const getController = useCallback(() => {
    if (!controllerRef.current || controllerRef.current.signal.aborted) {
      controllerRef.current = new AbortController();
    }
    return controllerRef.current;
  }, []);

  const abort = useCallback(() => {
    if (controllerRef.current && !controllerRef.current.signal.aborted) {
      controllerRef.current.abort();
    }
  }, []);

  // Abort on unmount
  useEffect(() => {
    return abort;
  }, [abort]);

  return {
    signal: getController().signal,
    abort,
    getController
  };
}

/**
 * Track subscriptions and ensure they're unsubscribed on unmount
 */
export function useSubscriptions() {
  const subscriptions = useRef<Set<() => void>>(new Set());

  const subscribe = useCallback((unsubscribe: () => void) => {
    subscriptions.current.add(unsubscribe);
    
    return () => {
      unsubscribe();
      subscriptions.current.delete(unsubscribe);
    };
  }, []);

  const unsubscribeAll = useCallback(() => {
    subscriptions.current.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error during unsubscribe:', error);
      }
    });
    subscriptions.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return unsubscribeAll;
  }, [unsubscribeAll]);

  return { subscribe, unsubscribeAll };
}