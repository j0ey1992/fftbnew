/**
 * Custom Error Classes for AI Implementation
 * 
 * This module defines specialized error types for different failure scenarios
 * in the AI implementation, allowing for more precise error handling and recovery.
 */

/**
 * Base class for all AI-related errors
 */
export class AIError extends Error {
  public readonly timestamp: Date;
  public readonly correlationId?: string;
  public readonly statusCode?: number;
  public readonly retryable: boolean;

  constructor(
    message: string, 
    options: { 
      correlationId?: string; 
      statusCode?: number; 
      retryable?: boolean;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.correlationId = options.correlationId;
    this.statusCode = options.statusCode;
    this.retryable = options.retryable ?? false;
    this.cause = options.cause;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when there's an issue with the API request or response
 */
export class APIError extends AIError {
  constructor(
    message: string,
    options: {
      correlationId?: string;
      statusCode?: number;
      retryable?: boolean;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      ...options,
      // API errors with 5xx status codes are typically retryable
      retryable: options.retryable ?? (options.statusCode ? options.statusCode >= 500 && options.statusCode < 600 : false)
    });
  }
}

/**
 * Error thrown when the API returns a rate limit exceeded response
 */
export class RateLimitError extends APIError {
  public readonly retryAfter?: number;

  constructor(
    message: string,
    options: {
      correlationId?: string;
      retryAfter?: number;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      ...options,
      statusCode: 429,
      retryable: true
    });
    this.retryAfter = options.retryAfter;
  }
}

/**
 * Error thrown when the API returns an authentication error
 */
export class AuthenticationError extends APIError {
  constructor(
    message: string,
    options: {
      correlationId?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      ...options,
      statusCode: 401,
      retryable: false
    });
  }
}

/**
 * Error thrown when the API returns a validation error
 */
export class ValidationError extends APIError {
  public readonly validationErrors: string[];

  constructor(
    message: string,
    validationErrors: string[] = [],
    options: {
      correlationId?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      ...options,
      statusCode: 400,
      retryable: false
    });
    this.validationErrors = validationErrors;
  }
}

/**
 * Error thrown when the API request times out
 */
export class TimeoutError extends APIError {
  public readonly timeoutMs: number;

  constructor(
    message: string,
    timeoutMs: number,
    options: {
      correlationId?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      ...options,
      statusCode: 408,
      retryable: true
    });
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Error thrown when the API is unavailable
 */
export class ServiceUnavailableError extends APIError {
  constructor(
    message: string,
    options: {
      correlationId?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      ...options,
      statusCode: 503,
      retryable: true
    });
  }
}

/**
 * Error thrown when there's a network issue
 */
export class NetworkError extends AIError {
  constructor(
    message: string,
    options: {
      correlationId?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      ...options,
      retryable: true
    });
  }
}

/**
 * Error thrown when the circuit breaker is open
 */
export class CircuitBreakerOpenError extends AIError {
  public readonly serviceName: string;
  public readonly resetTimeout: number;

  constructor(
    serviceName: string,
    resetTimeout: number,
    options: {
      correlationId?: string;
      cause?: Error;
    } = {}
  ) {
    super(`Circuit breaker is open for service: ${serviceName}. Try again after ${resetTimeout}ms`, {
      ...options,
      retryable: false
    });
    this.serviceName = serviceName;
    this.resetTimeout = resetTimeout;
  }
}

/**
 * Error thrown when the maximum number of retries is exceeded
 */
export class MaxRetriesExceededError extends AIError {
  public readonly maxRetries: number;
  public readonly originalError: Error;

  constructor(
    maxRetries: number,
    originalError: Error,
    options: {
      correlationId?: string;
    } = {}
  ) {
    super(`Maximum number of retries (${maxRetries}) exceeded`, {
      ...options,
      cause: originalError,
      retryable: false
    });
    this.maxRetries = maxRetries;
    this.originalError = originalError;
  }
}

/**
 * Error thrown when there's an issue with parsing the API response
 */
export class ResponseParsingError extends AIError {
  public readonly responseData: any;

  constructor(
    message: string,
    responseData: any,
    options: {
      correlationId?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      ...options,
      retryable: false
    });
    this.responseData = responseData;
  }
}

/**
 * Error thrown when the model generates invalid content
 */
export class InvalidGenerationError extends AIError {
  public readonly generatedContent: string;

  constructor(
    message: string,
    generatedContent: string,
    options: {
      correlationId?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      ...options,
      retryable: true
    });
    this.generatedContent = generatedContent;
  }
}