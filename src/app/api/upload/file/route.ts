import { NextRequest, NextResponse } from 'next/server'

// This route now redirects to the backend upload service
// to ensure files are properly stored in Firebase Storage
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This endpoint has been deprecated. Please use the backend upload service at /api/upload/image',
      details: 'Files should be uploaded to Firebase Storage for production compatibility'
    },
    { status: 410 } // 410 Gone
  )
}