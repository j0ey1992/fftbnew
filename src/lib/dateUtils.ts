import { Timestamp } from 'firebase/firestore';

/**
 * Format a date or timestamp to a readable string format
 */
export function formatDate(date: Date | Timestamp | string | undefined): string {
  if (!date) return 'N/A';
  
  let dateObj: Date;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Timestamp || (typeof date === 'object' && 'toDate' in date)) {
    // Firebase Timestamp or compatible object
    dateObj = date.toDate();
  } else {
    return 'Invalid date';
  }
  
  // Format with locale settings
  return dateObj.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Check if a date is in the past
 */
export function isExpired(date: Date | Timestamp | string | undefined): boolean {
  if (!date) return false;
  
  let dateObj: Date;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Timestamp || (typeof date === 'object' && 'toDate' in date)) {
    // Firebase Timestamp or compatible object
    dateObj = date.toDate();
  } else {
    return false;
  }
  
  return dateObj < new Date();
}

/**
 * Format a date as relative time (e.g. "3 days ago")
 */
export function formatRelativeTime(date: Date | Timestamp | string | undefined): string {
  if (!date) return 'N/A';
  
  let dateObj: Date;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Timestamp || (typeof date === 'object' && 'toDate' in date)) {
    // Firebase Timestamp or compatible object
    dateObj = date.toDate();
  } else {
    return 'Invalid date';
  }
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHr / 24);
  
  if (diffSec < 60) {
    return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  } else if (diffHr < 24) {
    return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateObj);
  }
}