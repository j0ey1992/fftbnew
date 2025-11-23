'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import sseClient from '@/lib/api/sse/client';

interface SSEContextValue {
  isConnected: boolean;
}

const SSEContext = createContext<SSEContextValue>({
  isConnected: false
});

export const useSSE = () => useContext(SSEContext);

interface SSEProviderProps {
  children: React.ReactNode;
}

export function SSEProvider({ children }: SSEProviderProps) {
  const connectionRef = useRef<boolean>(false);
  const [isConnected, setIsConnected] = React.useState(false);

  useEffect(() => {
    // Only connect once
    if (!connectionRef.current) {
      connectionRef.current = true;
      
      console.log('SSEProvider: Initializing SSE connection');
      sseClient.connect().then(() => {
        setIsConnected(true);
        console.log('SSEProvider: SSE connection established');
      }).catch((error) => {
        console.error('SSEProvider: Failed to establish SSE connection', error);
        setIsConnected(false);
      });
    }

    // Cleanup on unmount
    return () => {
      if (connectionRef.current) {
        console.log('SSEProvider: Disconnecting SSE');
        sseClient.disconnect();
        connectionRef.current = false;
        setIsConnected(false);
      }
    };
  }, []);

  return (
    <SSEContext.Provider value={{ isConnected }}>
      {children}
    </SSEContext.Provider>
  );
}