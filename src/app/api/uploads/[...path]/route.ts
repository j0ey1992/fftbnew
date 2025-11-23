import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

// Temporary route to serve existing local upload files
// This is a workaround until all images are migrated to Firebase Storage
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/')
    const fullPath = path.join(process.cwd(), 'public', 'uploads', filePath)
    
    // Security: Prevent directory traversal
    if (filePath.includes('..') || filePath.includes('~')) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    
    // Only allow image files
    const ext = path.extname(fullPath).toLowerCase()
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    if (!allowedExts.includes(ext)) {
      return new NextResponse('Not Found', { status: 404 })
    }
    
    try {
      const file = await readFile(fullPath)
      
      // Determine content type
      const contentType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      }[ext] || 'application/octet-stream'
      
      return new NextResponse(file, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      })
    } catch (error) {
      // File doesn't exist
      return new NextResponse('Not Found', { status: 404 })
    }
  } catch (error) {
    console.error('Error serving file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}