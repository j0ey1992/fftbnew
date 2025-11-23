/**
 * Enhanced Logging Utilities for AI Implementation
 * 
 * This module provides structured logging with correlation IDs, appropriate log levels,
 * and sensitive information redaction for the AI implementation.
 */

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

/**
 * Log entry structure
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId?: string;
  service: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Configuration for the logger
 */
export interface LoggerConfig {
  /** Minimum log level to output */
  minLevel: LogLevel;
  /** Service name for identification */
  service: string;
  /** Whether to include stack traces in error logs */
  includeStackTrace: boolean;
  /** List of field names that contain sensitive data to be redacted */
  sensitiveFields: string[];
  /** Custom output function */
  outputFn?: (entry: LogEntry) => void;
}

/**
 * Default logger configuration
 */
export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  minLevel: LogLevel.INFO,
  service: 'ai-service',
  includeStackTrace: true,
  sensitiveFields: [
    'apiKey', 
    'token', 
    'password', 
    'secret', 
    'authorization', 
    'credential',
    'jwt',
    'key',
    'private'
  ]
};

/**
 * Logger class for structured logging
 */
export class Logger {
  private config: LoggerConfig;
  
  /**
   * Creates a new logger
   * 
   * @param config - The logger configuration
   */
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_LOGGER_CONFIG, ...config };
  }
  
  /**
   * Logs a message at the specified level
   * 
   * @param level - The log level
   * @param message - The log message
   * @param context - Additional context information
   * @param correlationId - Optional correlation ID for tracking
   * @param error - Optional error object
   */
  log(
    level: LogLevel,
    message: string,
    context: Record<string, any> = {},
    correlationId?: string,
    error?: Error
  ): void {
    // Check if this log level should be output
    if (!this.shouldLog(level)) {
      return;
    }
    
    // Create log entry
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId,
      service: this.config.service,
      context: this.redactSensitiveInfo(context)
    };
    
    // Add error information if provided
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message
      };
      
      if (this.config.includeStackTrace) {
        entry.error.stack = error.stack;
      }
    }
    
    // Output the log entry
    this.output(entry);
  }
  
  /**
   * Logs a debug message
   */
  debug(message: string, context: Record<string, any> = {}, correlationId?: string): void {
    this.log(LogLevel.DEBUG, message, context, correlationId);
  }
  
  /**
   * Logs an info message
   */
  info(message: string, context: Record<string, any> = {}, correlationId?: string): void {
    this.log(LogLevel.INFO, message, context, correlationId);
  }
  
  /**
   * Logs a warning message
   */
  warn(message: string, context: Record<string, any> = {}, correlationId?: string, error?: Error): void {
    this.log(LogLevel.WARN, message, context, correlationId, error);
  }
  
  /**
   * Logs an error message
   */
  error(message: string, context: Record<string, any> = {}, correlationId?: string, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, correlationId, error);
  }
  
  /**
   * Logs a fatal error message
   */
  fatal(message: string, context: Record<string, any> = {}, correlationId?: string, error?: Error): void {
    this.log(LogLevel.FATAL, message, context, correlationId, error);
  }
  
  /**
   * Creates a child logger with a fixed correlation ID
   * 
   * @param correlationId - The correlation ID to use for all logs
   * @returns A new logger with the correlation ID set
   */
  withCorrelationId(correlationId: string): CorrelatedLogger {
    return new CorrelatedLogger(this, correlationId);
  }
  
  /**
   * Determines if a log level should be output
   * 
   * @param level - The log level to check
   * @returns Whether the log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
      LogLevel.FATAL
    ];
    
    const minLevelIndex = levels.indexOf(this.config.minLevel);
    const currentLevelIndex = levels.indexOf(level);
    
    return currentLevelIndex >= minLevelIndex;
  }
  
  /**
   * Outputs a log entry
   * 
   * @param entry - The log entry to output
   */
  private output(entry: LogEntry): void {
    if (this.config.outputFn) {
      this.config.outputFn(entry);
      return;
    }
    
    // Default output to console
    const logFn = this.getConsoleMethod(entry.level);
    
    // Format for console output
    const formattedEntry = {
      ...entry,
      timestamp: entry.timestamp,
      message: `[${entry.service}] ${entry.correlationId ? `(${entry.correlationId}) ` : ''}${entry.message}`
    };
    
    logFn(JSON.stringify(formattedEntry, null, 2));
  }
  
  /**
   * Gets the appropriate console method for a log level
   * 
   * @param level - The log level
   * @returns The console method to use
   */
  private getConsoleMethod(level: LogLevel): (message: string) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        return console.error;
      default:
        return console.log;
    }
  }
  
  /**
   * Redacts sensitive information from an object
   * 
   * @param obj - The object to redact
   * @returns A new object with sensitive information redacted
   */
  private redactSensitiveInfo(obj: Record<string, any>): Record<string, any> {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    
    const result: Record<string, any> = Array.isArray(obj) ? [] : {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Check if this key contains sensitive information
      const isSensitive = this.config.sensitiveFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      );
      
      if (isSensitive && typeof value === 'string') {
        // Redact sensitive string values
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        // Recursively redact nested objects
        result[key] = this.redactSensitiveInfo(value);
      } else {
        // Copy non-sensitive values as-is
        result[key] = value;
      }
    }
    
    return result;
  }
}

/**
 * Logger with a fixed correlation ID
 */
export class CorrelatedLogger {
  private logger: Logger;
  private correlationId: string;
  
  /**
   * Creates a new correlated logger
   * 
   * @param logger - The parent logger
   * @param correlationId - The correlation ID to use for all logs
   */
  constructor(logger: Logger, correlationId: string) {
    this.logger = logger;
    this.correlationId = correlationId;
  }
  
  /**
   * Logs a debug message
   */
  debug(message: string, context: Record<string, any> = {}): void {
    this.logger.debug(message, context, this.correlationId);
  }
  
  /**
   * Logs an info message
   */
  info(message: string, context: Record<string, any> = {}): void {
    this.logger.info(message, context, this.correlationId);
  }
  
  /**
   * Logs a warning message
   */
  warn(message: string, context: Record<string, any> = {}, error?: Error): void {
    this.logger.warn(message, context, this.correlationId, error);
  }
  
  /**
   * Logs an error message
   */
  error(message: string, context: Record<string, any> = {}, error?: Error): void {
    this.logger.error(message, context, this.correlationId, error);
  }
  
  /**
   * Logs a fatal error message
   */
  fatal(message: string, context: Record<string, any> = {}, error?: Error): void {
    this.logger.fatal(message, context, this.correlationId, error);
  }
}

/**
 * Creates a logger for the DeepSeek AI service
 */
export const aiLogger = new Logger({
  service: 'deepseek-ai',
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
});

/**
 * Generates a unique correlation ID
 * 
 * @returns A unique correlation ID
 */
export function generateCorrelationId(): string {
  return `ai-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}