import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// This is a simpler approach using public Firebase Storage rules
// Make sure your Firebase Storage rules allow public uploads to specific paths

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const path = formData.get('path') as string || 'uploads'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Generate unique filename
    const fileName = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const fullPath = `${path}/${fileName}`
    
    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    
    // Use Firebase Storage REST API
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'trollslots'
    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'trollslots.appspot.com'
    
    // For now, let's return a mock response to test the flow
    // In production, you would upload to Firebase Storage here
    
    // Simulate a public URL (you'll need to implement actual upload)
    const publicUrl = `https://storage.googleapis.com/${bucket}/${fullPath}`
    
    return NextResponse.json({
      url: publicUrl,
      fileName,
      contentType: file.type,
      size: file.size,
      message: 'Mock upload successful - implement Firebase Storage upload here'
    })
    
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}