import { NextRequest, NextResponse } from 'next/server';

export async function handleDAppRouting(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Check if this is a custom domain request
  if (!hostname.includes('localhost') && !hostname.includes('yourplatform.com')) {
    try {
      // Query the database to find the dApp associated with this domain
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dapps/domain/${hostname}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const dapp = await response.json();
        
        // Rewrite the URL to the dApp viewer with the path
        const url = request.nextUrl.clone();
        url.pathname = `/dapp/${dapp.settings.path}`;
        
        return NextResponse.rewrite(url);
      }
    } catch (error) {
      console.error('Error checking custom domain:', error);
    }
  }

  // Check for subdomain routing (e.g., myproject.yourplatform.com)
  const subdomain = hostname.split('.')[0];
  if (subdomain && subdomain !== 'www' && hostname.includes('yourplatform.com')) {
    // Rewrite subdomain to dApp path
    const url = request.nextUrl.clone();
    url.pathname = `/dapp/${subdomain}${pathname}`;
    
    return NextResponse.rewrite(url);
  }

  return null;
}