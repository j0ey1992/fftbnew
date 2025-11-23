/**
 * Reliability Utilities for AI Implementation
 * 
 * This module provides utilities for improving the reliability of AI API calls,
 * including retry mechanisms with exponential backoff and circuit breakers.
 */

import { 
  AIError, 
  MaxRetriesExceededError, 
  CircuitBreakerOpenError,
  NetworkError,
  ServiceUnavailableError,
  TimeoutError,
  RateLimitError
} from './errors';

/**
 * Configuration for retry mechanism
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Initial delay in milliseconds */
  initialDelayMs: number;
  /** Maximum delay in milliseconds */
  maxDelayMs: number;
  /** Jitter factor (0-1) to add randomness to backoff */
  jitterFactor: number;
  /** Function to determine if an error is retryable */
  isRetryable?: (error: Error) => boolean;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  jitterFactor: 0.2,
  isRetryable: (error: Error) => {
    // Retry if the error is explicitly marked as retryable
    if (error instanceof AIError) {
      return error.retryable;
    }
    
    // Retry network errors, timeouts, and service unavailable errors
    return (
      error instanceof NetworkError ||
      error instanceof TimeoutError ||
      error instanceof ServiceUnavailableError ||
      error instanceof RateLimitError ||
      // Also retry if the error is a fetch error with a status code >= 500
      (error instanceof Error && 
        error.message.includes('fetch failed') || 
        error.message.includes('network error'))
    );
  }
};

/**
 * Calculates the delay for a retry attempt using exponential backoff with jitter
 * 
 * @param attempt - The current retry attempt (0-based)
 * @param config - The retry configuration
 * @returns The delay in milliseconds
 */
export function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
  // Calculate exponential backoff: initialDelay * 2^attempt
  const exponentialDelay = config.initialDelayMs * Math.pow(2, attempt);
  
  // Apply maximum delay cap
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);
  
  // Apply jitter to prevent synchronized retries
  const jitter = config.jitterFactor * cappedDelay * (Math.random() - 0.5);
  
  return Math.max(0, Math.floor(cappedDelay + jitter));
}

/**
 * Executes a function with retry logic using exponential backoff
 * 
 * @param fn - The function to execute
 * @param config - The retry configuration
 * @param correlationId - Optional correlation ID for tracking
 * @returns The result of the function
 * @throws MaxRetriesExceededError if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  correlationId?: string
): Promise<T> {
  // Merge with default config
  const retryConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      // Execute the function
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if we should retry
      const shouldRetry = attempt < retryConfig.maxRetries && 
        (retryConfig.isRetryable ? retryConfig.isRetryable(lastError) : false);
      
      if (!shouldRetry) {
        break;
      }
      
      // Calculate delay for next retry
      const delayMs = calculateBackoffDelay(attempt, retryConfig);
      
      // Special handling for rate limit errors with retry-after header
      if (lastError instanceof RateLimitError && lastError.retryAfter) {
        // Use the retry-after value from the server if available
        await sleep(lastError.retryAfter * 1000);
      } else {
        // Use calculated backoff delay
        await sleep(delayMs);
      }
      
      // Log retry attempt
      console.warn(
        `Retrying operation (attempt ${attempt + 1}/${retryConfig.maxRetries}) after ${delayMs}ms due to error:`,
        lastError
      );
    }
  }
  
  // If we get here, all retries failed
  throw new MaxRetriesExceededError(
    retryConfig.maxRetries,
    lastError!,
    { correlationId }
  );
}

/**
 * Sleep utility function
 * 
 * @param ms - The number of milliseconds to sleep
 * @returns A promise that resolves after the specified time
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Circuit breaker states
 */
export enum CircuitState {
  CLOSED = 'CLOSED',   // Normal operation, requests pass through
  OPEN = 'OPEN',       // Circuit is open, requests fail fast
  HALF_OPEN = 'HALF_OPEN'  // Testing if service is healthy again
}

/**
 * Configuration for circuit breaker
 */
export interface CircuitBreakerConfig {
  /** Name of the service being protected */
  serviceName: string;
  /** Number of failures before opening the circuit */
  failureThreshold: number;
  /** Time window in milliseconds to count failures */
  failureWindowMs: number;
  /** Time in milliseconds before attempting to half-open the circuit */
  resetTimeoutMs: number;
  /** Maximum number of requests allowed in half-open state */
  halfOpenMaxRequests: number;
  /** Function to determine if an error should count as a failure */
  isFailure?: (error: Error) => boolean;
}

/**
 * Default circuit breaker configuration
 */
export const DEFAULT_CIRCUIT_BREAKER_CONFIG: Omit<CircuitBreakerConfig, 'serviceName'> = {
  failureThreshold: 5,
  failureWindowMs: 60000, // 1 minute
  resetTimeoutMs: 30000,  // 30 seconds
  halfOpenMaxRequests: 3,
  isFailure: (error: Error) => {
    // Count server errors (5xx) as failures
    if (error instanceof AIError && error.statusCode) {
      return error.statusCode >= 500 && error.statusCode < 600;
    }
    
    // Count network errors and timeouts as failures
    return (
      error instanceof NetworkError ||
      error instanceof TimeoutError ||
      error instanceof ServiceUnavailableError
    );
  }
};

/**
 * Circuit breaker implementation
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private resetTimeout: NodeJS.Timeout | null = null;
  private halfOpenRequests: number = 0;
  private readonly config: CircuitBreakerConfig;
  
  /**
   * Creates a new circuit breaker
   * 
   * @param config - The circuit breaker configuration
   */
  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }
  
  /**
   * Executes a function with circuit breaker protection
   * 
   * @param fn - The function to execute
   * @param correlationId - Optional correlation ID for tracking
   * @returns The result of the function
   * @throws CircuitBreakerOpenError if the circuit is open
   */
  async execute<T>(fn: () => Promise<T>, correlationId?: string): Promise<T> {
    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      throw new CircuitBreakerOpenError(
        this.config.serviceName,
        this.config.resetTimeoutMs,
        { correlationId }
      );
    }
    
    // If circuit is half-open, check if we can allow the request
    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenRequests >= this.config.halfOpenMaxRequests) {
        throw new CircuitBreakerOpenError(
          this.config.serviceName,
          this.config.resetTimeoutMs,
          { correlationId }
        );
      }
      
      this.halfOpenRequests++;
    }
    
    try {
      // Execute the function
      const result = await fn();
      
      // If successful and in half-open state, close the circuit
      if (this.state === CircuitState.HALF_OPEN) {
        this.closeCircuit();
      }
      
      return result;
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      
      // Check if this error counts as a failure
      if (this.config.isFailure && this.config.isFailure(actualError)) {
        this.recordFailure();
        
        // If in half-open state, any failure reopens the circuit
        if (this.state === CircuitState.HALF_OPEN) {
          this.openCircuit();
        }
      }
      
      throw actualError;
    }
  }
  
  /**
   * Records a failure and potentially opens the circuit
   */
  private recordFailure(): void {
    const now = Date.now();
    
    // Reset failure count if outside the failure window
    if (now - this.lastFailureTime > this.config.failureWindowMs) {
      this.failures = 0;
    }
    
    this.failures++;
    this.lastFailureTime = now;
    
    // Check if we should open the circuit
    if (this.state === CircuitState.CLOSED && this.failures >= this.config.failureThreshold) {
      this.openCircuit();
    }
  }
  
  /**
   * Opens the circuit
   */
  private openCircuit(): void {
    this.state = CircuitState.OPEN;
    this.halfOpenRequests = 0;
    
    // Schedule reset to half-open state
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
    
    this.resetTimeout = setTimeout(() => {
      this.state = CircuitState.HALF_OPEN;
      this.halfOpenRequests = 0;
    }, this.config.resetTimeoutMs);
    
    console.warn(`Circuit breaker opened for service: ${this.config.serviceName}`);
  }
  
  /**
   * Closes the circuit
   */
  private closeCircuit(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.halfOpenRequests = 0;
    
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
      this.resetTimeout = null;
    }
    
    console.info(`Circuit breaker closed for service: ${this.config.serviceName}`);
  }
  
  /**
   * Gets the current state of the circuit
   */
  getState(): CircuitState {
    return this.state;
  }
  
  /**
   * Resets the circuit breaker to closed state
   */
  reset(): void {
    this.closeCircuit();
  }
}

/**
 * Creates a circuit breaker for the DeepSeek API
 */
export const deepSeekCircuitBreaker = new CircuitBreaker({
  serviceName: 'DeepSeek API',
  ...DEFAULT_CIRCUIT_BREAKER_CONFIG
});

/**
 * Executes a function with both retry and circuit breaker protection
 * 
 * @param fn - The function to execute
 * @param retryConfig - The retry configuration
 * @param correlationId - Optional correlation ID for tracking
 * @returns The result of the function
 */
export async function withReliability<T>(
  fn: () => Promise<T>,
  retryConfig: Partial<RetryConfig> = {},
  correlationId?: string
): Promise<T> {
  return deepSeekCircuitBreaker.execute(
    () => withRetry(fn, retryConfig, correlationId),
    correlationId
  );
}