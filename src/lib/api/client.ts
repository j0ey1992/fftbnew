import { API_BASE_URL, DEFAULT_TIMEOUT } from './config';
import { getAuthHeaders } from './auth';

/**
 * HTTP request methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API request options
 */
export interface ApiRequestOptions {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: any;
  timeout?: number;
  requireAuth?: boolean;
  rawResponse?: boolean;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  status: number;
  statusText: string;
  message: string;
  data?: any;
}

/**
 * API error class
 */
export class ApiError extends Error {
  status: number;
  statusText: string;
  data?: any;

  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.name = 'ApiError';
    this.status = response.status;
    this.statusText = response.statusText;
    this.data = response.data;
    
    // Improve error message formatting for better debugging
    Object.defineProperty(this, 'message', {
      get() {
        // For 403 errors, provide more detailed information
        if (this.status === 403) {
          return `Forbidden (403): ${response.message || 'Access denied'}${
            this.data?.reason ? ` - ${this.data.reason}` : ''
          }`;
        }
        
        // For other errors, provide status and message
        return `${this.statusText} (${this.status}): ${response.message}${
          this.data?.error ? ` - ${this.data.error}` : ''
        }`;
      }
    });
  }

  /**
   * Custom toString method to provide better error messages
   */
  toString() {
    return this.message;
  }
}

// Store CSRF token in memory as fallback for cross-origin issues
let csrfTokenInMemory: string | null = null;

/**
 * Core API client for making requests to the backend
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get CSRF token from cookie or memory
   * @returns CSRF token or null if not found
   */
  private getCSRFToken(): string | null {
    // First try to get from cookie
    if (typeof document !== 'undefined') {
      const name = 'csrf-token=';
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookieArray = decodedCookie.split(';');
      
      for (let cookie of cookieArray) {
        cookie = cookie.trim();
        if (cookie.indexOf(name) === 0) {
          return cookie.substring(name.length, cookie.length);
        }
      }
    }
    
    // Fallback to in-memory token for cross-origin scenarios
    return csrfTokenInMemory;
  }
  
  /**
   * Ensure CSRF token is available
   */
  private async ensureCSRFToken(): Promise<void> {
    if (this.getCSRFToken()) {
      return;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/csrf-token`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          csrfTokenInMemory = data.token;
        }
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  }

  /**
   * Make an API request
   * @param endpoint API endpoint path
   * @param options Request options
   * @returns Promise with response data
   */
  async request<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = DEFAULT_TIMEOUT,
      requireAuth = false,
      rawResponse = false
    } = options;

    // Build request URL
    const url = `${this.baseUrl}${endpoint}`;

    // Prepare headers
    let requestHeaders: HeadersInit = { ...headers };
    
    // Add auth headers if required
    if (requireAuth) {
      const authHeaders = await getAuthHeaders();
      requestHeaders = { ...requestHeaders, ...authHeaders };
    }
    
    // Ensure CSRF token is available for state-changing requests
    if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      await this.ensureCSRFToken();
      const csrfToken = this.getCSRFToken();
      if (csrfToken) {
        requestHeaders['x-csrf-token'] = csrfToken;
      }
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include', // Include cookies for CSRF token
    };

    // Add body for non-GET requests
    if (method !== 'GET' && body !== undefined) {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    requestOptions.signal = controller.signal;

    // Set timeout
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Make the request
      const response = await fetch(url, requestOptions);
      
      // Clear timeout
      clearTimeout(timeoutId);

      // Return raw response if requested
      if (rawResponse) {
        return response as unknown as T;
      }

      // Parse response data
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle error responses
      if (!response.ok) {
        // Extract error message from response data
        let errorMessage = 'API request failed';
        
        if (data) {
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (typeof data === 'object') {
            // Try to extract error message from various common patterns
            errorMessage = data.error ||
                          data.message ||
                          data.errorMessage ||
                          (data.errors && data.errors[0]?.message) ||
                          errorMessage;
            
            // For 403 errors, try to extract more specific information
            if (response.status === 403) {
              const reason = data.reason ||
                            data.details ||
                            (data.error === 'Forbidden' && data.message) ||
                            'Access denied';
              
              errorMessage = `${errorMessage}${reason !== errorMessage ? ` - ${reason}` : ''}`;
            }
          }
        }
        
        // Add more context to the error message based on status code
        if (response.status === 401) {
          errorMessage = `Authentication required: ${errorMessage}`;
          console.error('Authentication error:', {
            endpoint,
            status: response.status,
            message: errorMessage
          });
        } else if (response.status === 403) {
          console.error('Authorization error:', {
            endpoint,
            status: response.status,
            message: errorMessage
          });
        } else if (response.status === 404) {
          console.error('Resource not found:', {
            endpoint,
            status: response.status,
            message: errorMessage
          });
        } else if (response.status >= 500) {
          console.error('Server error:', {
            endpoint,
            status: response.status,
            message: errorMessage
          });
        } else {
          console.error('API request failed:', {
            endpoint,
            status: response.status,
            message: errorMessage
          });
        }
        
        throw new ApiError({
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          data
        });
      }

      return data as T;
    } catch (error) {
      // Clear timeout
      clearTimeout(timeoutId);

      // Handle abort error (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError({
          status: 408,
          statusText: 'Request Timeout',
          message: `Request timed out after ${timeout}ms`
        });
      }

      // Re-throw ApiError
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle other errors
      throw new ApiError({
        status: 0,
        statusText: 'Unknown Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        data: error
      });
    }
  }

  /**
   * Make a GET request
   * @param endpoint API endpoint path
   * @param options Request options
   * @returns Promise with response data
   */
  async get<T = any>(endpoint: string, options: Omit<ApiRequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request
   * @param endpoint API endpoint path
   * @param body Request body
   * @param options Request options
   * @returns Promise with response data
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * Make a PUT request
   * @param endpoint API endpoint path
   * @param body Request body
   * @param options Request options
   * @returns Promise with response data
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * Make a PATCH request
   * @param endpoint API endpoint path
   * @param body Request body
   * @param options Request options
   * @returns Promise with response data
   */
  async patch<T = any>(
    endpoint: string,
    body?: any,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  /**
   * Make a DELETE request
   * @param endpoint API endpoint path
   * @param options Request options
   * @returns Promise with response data
   */
  async delete<T = any>(endpoint: string, options: Omit<ApiRequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create and export default API client instance
const apiClient = new ApiClient();
export { apiClient };
export default apiClient;