import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @param options - Additional DOMPurify options
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string, options?: DOMPurify.Config): string {
  // Only runs on client-side
  if (typeof window === 'undefined') {
    // On server-side, return empty string or strip all HTML
    return html.replace(/<[^>]*>/g, '')
  }

  // Configure DOMPurify with safe defaults
  const defaultConfig: DOMPurify.Config = {
    ALLOWED_TAGS: ['strong', 'em', 'code', 'br', 'p', 'span'],
    ALLOWED_ATTR: ['class'],
    KEEP_CONTENT: true,
    ...options
  }

  return DOMPurify.sanitize(html, defaultConfig)
}

/**
 * Format message content with markdown-like syntax
 * @param text - The text to format
 * @returns Formatted HTML string
 */
export function formatMessageContent(text: string): string {
  // Escape HTML entities first
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  // Apply markdown-like formatting
  // Bold text between ** markers
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // Italic text between * markers (but not **)
  escaped = escaped.replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  
  // Code blocks between ` markers
  escaped = escaped.replace(
    /`([^`]+)`/g, 
    '<code class="bg-gray-800 px-1 py-0.5 rounded text-blue-300 font-mono text-sm">$1</code>'
  )

  // Sanitize the final HTML
  return sanitizeHtml(escaped)
}