import { useEffect, useRef } from 'react';
import type { DAppPage, DAppTheme } from '@/types/dapp-builder';

export const useAutoSave = (
  pages: DAppPage[],
  theme: DAppTheme,
  onSave?: (pages: DAppPage[], theme: DAppTheme) => void,
  delay: number = 5000
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<string>();

  useEffect(() => {
    const currentData = JSON.stringify({ pages, theme });
    
    // Skip if data hasn't changed
    if (previousDataRef.current === currentData) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      if (onSave) {
        onSave(pages, theme);
        console.log('Auto-saved');
      }
      previousDataRef.current = currentData;
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pages, theme, onSave, delay]);
};