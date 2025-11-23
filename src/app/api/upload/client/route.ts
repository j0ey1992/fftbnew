import { NextRequest, NextResponse } from 'next/server'

// This endpoint returns Firebase upload configuration for client-side uploads
// The actual upload happens on the client using Firebase SDK with proper CORS settings

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json()
    
    // Return configuration for client-side upload
    return NextResponse.json({
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      path: path || 'uploads',
      // Add a timestamp to make filenames unique
      timestamp: Date.now()
    })
    
  } catch (error: any) {
    console.error('Config error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get upload config' },
      { status: 500 }
    )
  }
}