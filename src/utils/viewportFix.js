/**
 * Viewport height fix for mobile browsers
 * 
 * This script addresses the issue with 100vh not working correctly on mobile browsers
 * by setting a CSS variable (--vh) that can be used instead of vh units.
 */

export function initViewportHeightFix() {
  // Only run on client
  if (typeof window === 'undefined') return;
  
  // Initial calculation
  updateViewportHeight();
  
  // Update on resize and orientation change
  window.addEventListener('resize', updateViewportHeight);
  window.addEventListener('orientationchange', updateViewportHeight);
  
  // Clean up on unmount if needed
  return () => {
    window.removeEventListener('resize', updateViewportHeight);
    window.removeEventListener('orientationchange', updateViewportHeight);
  };
}

function updateViewportHeight() {
  // Get the viewport height and multiply by 1% to get a value for a vh unit
  const vh = window.innerHeight * 0.01;
  
  // Set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}