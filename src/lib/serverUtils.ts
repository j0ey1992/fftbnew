import { NextRequest } from 'next/server';

/**
 * Detect device type from user agent string (server-side version)
 * @param userAgent User agent string
 * @returns Device type ('mobile' or 'desktop')
 */
export function detectDeviceTypeServer(userAgent: string): 'mobile' | 'desktop' {
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  
  return mobileRegex.test(userAgent) ? 'mobile' : 'desktop';
}

/**
 * Detect device type from Next.js request (server-side version)
 * @param req Next.js request object
 * @returns Device type ('mobile' or 'desktop')
 */
export function detectDeviceTypeFromRequestServer(req: NextRequest): 'mobile' | 'desktop' {
  const userAgent = req.headers.get('user-agent') || '';
  return detectDeviceTypeServer(userAgent);
}