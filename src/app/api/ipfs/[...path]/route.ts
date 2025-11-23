import { NextRequest, NextResponse } from 'next/server'

// Proxy for IPFS gateway to avoid mixed content issues
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const ipfsPath = params.path.join('/')
    const gatewayUrl = `http://88.99.93.159:3000/api/ipfs/${ipfsPath}`
    
    // Get query parameters from the original request
    const url = new URL(request.url)
    const queryString = url.search
    
    // Fetch from the IPFS gateway
    const response = await fetch(`${gatewayUrl}${queryString}`, {
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'Next.js Proxy',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })
    
    if (!response.ok) {
      return new NextResponse('Gateway Error', { status: response.status })
    }
    
    // Get the content
    const buffer = await response.arrayBuffer()
    
    // Forward the response with appropriate headers
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('IPFS proxy error:', error)
    
    if (error instanceof Error && error.name === 'AbortError') {
      return new NextResponse('Gateway Timeout', { status: 504 })
    }
    
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}