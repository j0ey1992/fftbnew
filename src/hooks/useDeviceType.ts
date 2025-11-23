'use client';

import { useState, useEffect } from 'react';
import useUserProfile from '@/hooks/useUserProfile';
import { detectDeviceType } from '@/lib/profileUtils';

/**
 * Hook to detect device type and update user profile accordingly
 * Uses the device-type cookie set by middleware if available,
 * otherwise detects device type from user agent
 * 
 * @returns Object containing device type and loading state
 */
export default function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');
  const [loading, setLoading] = useState(true);
  const { user, updateDeviceType } = useUserProfile();
  
  useEffect(() => {
    // Function to detect device type
    const detectAndSetDeviceType = async () => {
      setLoading(true);
      
      try {
        // First try to get device type from cookie
        const cookies = document.cookie.split(';');
        const deviceTypeCookie = cookies
          .find(cookie => cookie.trim().startsWith('device-type='));
        
        let detectedType: 'mobile' | 'desktop';
        
        if (deviceTypeCookie) {
          // Use device type from cookie
          const cookieValue = deviceTypeCookie.split('=')[1].trim();
          detectedType = (cookieValue === 'mobile' ? 'mobile' : 'desktop');
        } else {
          // Detect device type from user agent
          const userAgent = navigator.userAgent;
          detectedType = detectDeviceType(userAgent);
          
          // Set cookie for future use
          document.cookie = `device-type=${detectedType}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        }
        
        // Update state
        setDeviceType(detectedType);
        
        // Update user profile if logged in and device type has changed
        if (user && user.deviceType !== detectedType) {
          await updateDeviceType(detectedType);
        }
      } catch (error) {
        console.error('Error detecting device type:', error);
        // Default to desktop on error
        setDeviceType('desktop');
      } finally {
        setLoading(false);
      }
    };
    
    // Detect device type on mount
    detectAndSetDeviceType();
    
    // Re-detect on window resize (for responsive testing)
    const handleResize = () => {
      // Only re-detect if window width crosses mobile/desktop threshold
      const isMobileWidth = window.innerWidth < 768;
      const shouldBeMobile = isMobileWidth ? 'mobile' : 'desktop';
      
      if (shouldBeMobile !== deviceType) {
        detectAndSetDeviceType();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [user, updateDeviceType, deviceType]);
  
  return {
    deviceType,
    isMobile: deviceType === 'mobile',
    isDesktop: deviceType === 'desktop',
    loading
  };
}