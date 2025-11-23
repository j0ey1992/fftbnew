import { NextResponse } from 'next/server';

export async function GET() {
  // Return the project ID with proper headers
  return NextResponse.json({ 
    projectId: '7b7cd4d698d7ca7ddab6825056af50ef' 
  }, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    }
  });
}