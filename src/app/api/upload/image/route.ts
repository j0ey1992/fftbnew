import { NextRequest, NextResponse } from 'next/server'
import { adminApp } from '@/lib/firebase/admin-config'
import { getStorage } from 'firebase-admin/storage'
import { v4 as uuidv4 } from 'uuid'

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Allowed MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const path = formData.get('path') as string || 'uploads'
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      )
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Generate unique filename
    const fileName = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const fullPath = `${path}/${fileName}`
    
    // Get storage bucket with explicit bucket name
    const storage = getStorage(adminApp)
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'trollslots.appspot.com'
    const bucket = storage.bucket(bucketName)
    
    console.log('Using bucket:', bucketName)
    
    // Create file reference
    const fileRef = bucket.file(fullPath)
    
    // Upload file
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          firebaseStorageDownloadTokens: uuidv4(), // This creates a public download token
        }
      }
    })
    
    // Make file public
    await fileRef.makePublic()
    
    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fullPath}`
    
    return NextResponse.json({
      url: publicUrl,
      fileName,
      contentType: file.type,
      size: file.size
    })
    
  } catch (error: any) {
    console.error('Upload error:', error)
    console.error('Error details:', error.code, error.details)
    
    // More specific error messages
    let errorMessage = 'Failed to upload file'
    if (error.code === 404) {
      errorMessage = 'Storage bucket not found. Please check Firebase configuration.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}