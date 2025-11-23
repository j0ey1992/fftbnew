'use client'

import Script from 'next/script'

export function HeadScripts() {
  return (
    <>
      {/* Mobile viewport optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      <Script id="reown-init" strategy="afterInteractive">
        {`
          try {
            window.addEventListener('DOMContentLoaded', function() {
              console.log('DOM fully loaded, initializing Reown...');
              
              // Force AppKit initialization as early as possible
              if (typeof window !== 'undefined') {
                import('@/lib/reown/init').then(module => {
                  if (module && module.initializeAppKit) {
                    console.log('Initializing AppKit from script...');
                    module.initializeAppKit();
                  }
                }).catch(err => {
                  console.error('Error importing AppKit init module:', err);
                });
              }
            });
          } catch (error) {
            console.error('Error initializing Reown:', error);
          }
        `}
      </Script>
    </>
  )
}
