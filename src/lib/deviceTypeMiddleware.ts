import { NextRequest, NextResponse } from 'next/server';
import { detectDeviceTypeFromRequestServer } from './serverUtils';

/**
 * Middleware to detect device type and set a cookie
 * This allows client-side code to know the device type without
 * having to re-detect it on each page load
 * 
 * @param req Next.js request object
 * @returns Next.js response object with device type cookie
 */
export async function deviceTypeMiddleware(req: NextRequest): Promise<NextResponse> {
  // Get the device type from the request using server-side function
  const deviceType = detectDeviceTypeFromRequestServer(req);
  
  // Get the response
  const response = NextResponse.next();
  
  // Set a cookie with the device type if it doesn't exist or has changed
  const currentDeviceType = req.cookies.get('device-type')?.value;
  
  if (currentDeviceType !== deviceType) {
    // Set the cookie with a 30-day expiration
    response.cookies.set({
      name: 'device-type',
      value: deviceType,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false, // Allow JavaScript access
      sameSite: 'lax'
    });
  }
  
  return response;
}