'use client'

/**
 * DeepSeek AI API client for generating smart contract code and providing AI responses
 * for the deployment interface.
 *
 * This module includes:
 * - Robust error handling with custom error types
 * - Retry mechanisms with exponential backoff
 * - Circuit breaker pattern for API resilience
 * - Enhanced logging with correlation IDs
 */

import {
  AIError,
  APIError,
  AuthenticationError,
  RateLimitError,
  TimeoutError,
  NetworkError,
  ServiceUnavailableError,
  ResponseParsingError,
  ValidationError
} from './errors';
import { withReliability } from './reliability';
import { aiLogger, generateCorrelationId } from './logging';
import {
  generateCacheKey,
  getCachedOrGenerate,
  shouldCacheRequest,
  determineCacheTTL
} from './cache';

// API configuration
const API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || ''
const BASE_URL = process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
const DEFAULT_TIMEOUT_MS = 30000 // 30 seconds
const API_KEY_AVAILABLE = !!process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY

// Validate API key is available
if (!API_KEY_AVAILABLE) {
  aiLogger.error('DEEPSEEK_API_KEY environment variable is not set', {
    service: 'deepseek-ai',
    severity: 'high'
  });
}

// Interface for API request options
interface RequestOptions {
  model: string
  messages: Message[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
  timeoutMs?: number
}

// Message interface for chat completions
interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * API response interface
 */
interface ApiResponse {
  choices: Array<{
    message: {
      content: string
    }
    delta?: {
      content?: string
    }
  }>
  error?: {
    message: string
    type: string
    code: string
  }
}

/**
 * Validates and sanitizes input to prevent injection attacks
 * @param input The input to validate
 * @param correlationId Optional correlation ID for tracking
 * @returns The sanitized input or throws an error if invalid
 */
function validateAndSanitizeInput(input: string, correlationId?: string): string {
  if (!input || typeof input !== 'string') {
    throw new ValidationError('Input must be a non-empty string', [], { correlationId });
  }
  
  // Limit input length to prevent DoS
  const MAX_INPUT_LENGTH = 8000;
  if (input.length > MAX_INPUT_LENGTH) {
    aiLogger.warn(
      'Input exceeds maximum length and will be truncated',
      { originalLength: input.length, maxLength: MAX_INPUT_LENGTH },
      correlationId
    );
    return input.substring(0, MAX_INPUT_LENGTH);
  }
  
  return input;
}

/**
 * Makes a request to the DeepSeek API with error handling and retries
 * @param endpoint API endpoint
 * @param options Request options
 * @param correlationId Correlation ID for tracking
 * @returns API response
 */
async function makeApiRequest(
  endpoint: string,
  options: RequestOptions,
  correlationId: string
): Promise<Response> {
  // Check if API key is available before making the request
  if (!API_KEY_AVAILABLE) {
    throw new AuthenticationError(
      'DeepSeek API key is not configured. Please set the NEXT_PUBLIC_DEEPSEEK_API_KEY environment variable.',
      { correlationId }
    );
  }

  const url = `${BASE_URL}${endpoint}`;
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    aiLogger.debug(
      `Making API request to ${endpoint}`,
      {
        model: options.model,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
        stream: options.stream,
        messageCount: options.messages.length
      },
      correlationId
    );
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(options),
      signal: controller.signal
    });
    
    // Handle HTTP errors
    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: { message: response.statusText } };
      }
      
      const errorMessage = errorData.error?.message || response.statusText;
      
      // Log the error
      aiLogger.error(
        `API request failed with status ${response.status}`,
        {
          status: response.status,
          statusText: response.statusText,
          errorMessage
        },
        correlationId
      );
      
      // Throw appropriate error based on status code
      switch (response.status) {
        case 401:
          throw new AuthenticationError(`Authentication failed: ${errorMessage}`, { correlationId });
        case 429:
          const retryAfter = response.headers.get('retry-after');
          throw new RateLimitError(
            `Rate limit exceeded: ${errorMessage}`,
            {
              correlationId,
              retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined
            }
          );
        case 400:
          throw new ValidationError(`Invalid request: ${errorMessage}`, [], { correlationId });
        case 408:
          throw new TimeoutError(`Request timeout: ${errorMessage}`, timeoutMs, { correlationId });
        case 503:
          throw new ServiceUnavailableError(`Service unavailable: ${errorMessage}`, { correlationId });
        default:
          if (response.status >= 500) {
            throw new APIError(`Server error: ${errorMessage}`, {
              correlationId,
              statusCode: response.status,
              retryable: true
            });
          } else {
            throw new APIError(`API error: ${errorMessage}`, {
              correlationId,
              statusCode: response.status
            });
          }
      }
    }
    
    return response;
  } catch (error) {
    // Handle fetch errors and timeouts
    if (error instanceof AIError) {
      // Re-throw AIErrors
      throw error;
    } else if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new TimeoutError(`Request timed out after ${timeoutMs}ms`, timeoutMs, {
          correlationId,
          cause: error
        });
      } else if (
        error.message.includes('fetch failed') ||
        error.message.includes('network') ||
        error.message.includes('connection')
      ) {
        throw new NetworkError(`Network error: ${error.message}`, {
          correlationId,
          cause: error
        });
      } else {
        throw new APIError(`API request failed: ${error.message}`, {
          correlationId,
          cause: error
        });
      }
    } else {
      throw new APIError(`Unknown error during API request`, { correlationId });
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Generate a response from the DeepSeek API
 */
export async function generateAIResponse(
  prompt: string,
  systemPrompt: string = 'You are an AI assistant specialized in blockchain and smart contract development. When asked about contract deployment, always use the application\'s built-in deployment capabilities and never suggest external tools like Remix IDE.',
  options: Partial<RequestOptions> = {}
): Promise<string> {
  // Generate a correlation ID for this request
  const correlationId = generateCorrelationId();
  
  // Create a logger with this correlation ID
  const logger = aiLogger.withCorrelationId(correlationId);
  
  logger.info('Generating AI response', {
    promptLength: prompt?.length || 0,
    systemPromptLength: systemPrompt?.length || 0,
    options: {
      temperature: options.temperature,
      max_tokens: options.max_tokens,
      model: options.model
    }
  });

  // Check if API key is available before proceeding
  if (!API_KEY_AVAILABLE) {
    logger.error('Cannot generate AI response: DeepSeek API key is not configured', {
      service: 'deepseek-ai'
    });
    return 'I apologize, but the AI service is currently unavailable due to missing API credentials. Please contact the administrator to set up the DeepSeek API key.';
  }
  
  try {
    // Validate inputs
    prompt = validateAndSanitizeInput(prompt, correlationId);
    systemPrompt = validateAndSanitizeInput(systemPrompt, correlationId);
    
    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    const requestOptions: RequestOptions = {
      model: options.model || 'deepseek-chat',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
      timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS
    };

    // Check if this request should be cached
    const shouldCache = shouldCacheRequest({
      prompt,
      systemPrompt,
      temperature: requestOptions.temperature,
      model: requestOptions.model
    });

    if (shouldCache) {
      // Generate cache key based on request parameters
      const cacheKey = generateCacheKey({
        prompt,
        systemPrompt,
        temperature: requestOptions.temperature,
        max_tokens: requestOptions.max_tokens,
        model: requestOptions.model
      });

      // Determine appropriate TTL for this request
      const cacheTTL = determineCacheTTL({
        isSystemPrompt: prompt.length < systemPrompt.length,
        messages: messages.length
      });

      logger.debug('Using cache for AI response', {
        cacheKey: cacheKey.substring(0, 8) + '...',
        shouldCache,
        cacheTTL
      });

      // Get from cache or generate
      return await getCachedOrGenerate<string>(
        cacheKey,
        async () => {
          // Use reliability utilities for the API request
          const response = await withReliability(
            async () => makeApiRequest('/v1/chat/completions', requestOptions, correlationId),
            {
              maxRetries: 3,
              initialDelayMs: 1000
            },
            correlationId
          );

          // Parse the response
          let data: ApiResponse;
          try {
            data = await response.json();
          } catch (error) {
            throw new ResponseParsingError(
              'Failed to parse API response',
              await response.text(),
              { correlationId, cause: error instanceof Error ? error : undefined }
            );
          }

          if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new ResponseParsingError(
              'Invalid API response format',
              data,
              { correlationId }
            );
          }

          const content = data.choices[0].message.content;
          
          logger.debug('Successfully generated AI response', {
            responseLength: content.length,
            cached: false
          });
          
          return content;
        },
        cacheTTL
      );
    } else {
      // For non-cacheable requests, proceed without caching
      // Use reliability utilities for the API request
      const response = await withReliability(
        async () => makeApiRequest('/v1/chat/completions', requestOptions, correlationId),
        {
          maxRetries: 3,
          initialDelayMs: 1000
        },
        correlationId
      );

      // Parse the response
      let data: ApiResponse;
      try {
        data = await response.json();
      } catch (error) {
        throw new ResponseParsingError(
          'Failed to parse API response',
          await response.text(),
          { correlationId, cause: error instanceof Error ? error : undefined }
        );
      }

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new ResponseParsingError(
          'Invalid API response format',
          data,
          { correlationId }
        );
      }

      const content = data.choices[0].message.content;
      
      logger.debug('Successfully generated AI response', {
        responseLength: content.length,
        cached: false
      });
      
      return content;
    }
  } catch (error) {
    // Log the error
    if (error instanceof AIError) {
      logger.error(`AI generation failed: ${error.message}`, {}, error);
    } else {
      logger.error(
        'Unexpected error generating AI response',
        {},
        error instanceof Error ? error : new Error(String(error))
      );
    }
    
    // For user-facing errors, provide a friendly message
    if (error instanceof ValidationError) {
      return 'I apologize, but there was an issue with the input provided. Please check your request and try again.';
    } else if (error instanceof RateLimitError) {
      return 'I apologize, but we\'ve reached our API rate limit. Please try again in a few moments.';
    } else if (error instanceof TimeoutError) {
      return 'I apologize, but the request timed out. Please try again with a simpler query.';
    } else if (error instanceof NetworkError || error instanceof ServiceUnavailableError) {
      return 'I apologize, but there was a network issue connecting to the AI service. Please check your connection and try again.';
    } else {
      return 'I apologize, but I encountered an error while processing your request. Please try again.';
    }
  }
}

/**
 * Generate smart contract code based on user specifications
 */
export async function generateSmartContract(
  contractType: string,
  parameters: Record<string, any>
): Promise<string> {
  // Generate a correlation ID for this request
  const correlationId = generateCorrelationId();
  
  // Create a logger with this correlation ID
  const logger = aiLogger.withCorrelationId(correlationId);
  
  logger.info('Generating smart contract', {
    contractType,
    parameterCount: Object.keys(parameters).length
  });

  // Check if API key is available before proceeding
  if (!API_KEY_AVAILABLE) {
    logger.error('Cannot generate smart contract: DeepSeek API key is not configured', {
      service: 'deepseek-ai',
      contractType
    });
    throw new AuthenticationError(
      'DeepSeek API key is not configured. Please set the NEXT_PUBLIC_DEEPSEEK_API_KEY environment variable.',
      { correlationId }
    );
  }
  
  try {
    // Validate contract type
    if (!contractType || typeof contractType !== 'string') {
      throw new ValidationError('Contract type must be a non-empty string', [], { correlationId });
    }
    
    // Validate parameters
    if (!parameters || typeof parameters !== 'object') {
      throw new ValidationError('Parameters must be a valid object', [], { correlationId });
    }
    
    // Sanitize contract type
    contractType = validateAndSanitizeInput(contractType, correlationId);
    
    const systemPrompt = `You are an expert Solidity developer specializing in creating secure,
    gas-efficient smart contracts. Generate production-ready Solidity code that follows best practices
    and security standards. Include detailed comments explaining the code.
    
    IMPORTANT: When discussing deployment in comments or documentation, always refer to using this application's
    built-in deployment capabilities. Never suggest external tools like Remix IDE or other deployment methods.`;

    let prompt = `Generate a complete Solidity smart contract for a ${contractType} with the following parameters:\n\n`;
    
    // Add parameters to the prompt
    Object.entries(parameters).forEach(([key, value]) => {
      prompt += `- ${key}: ${value}\n`;
    });
    
    // Add specific instructions based on contract type
    if (contractType.includes('erc20')) {
      prompt += `\nThe contract should be ERC20 compliant and include:
      - Safe math operations
      - Access control for admin functions
      - Events for important state changes
      - Use OpenZeppelin contracts where appropriate
      - Include proper documentation with NatSpec format`;
      
      if (contractType.includes('tax')) {
        prompt += `\nAdditionally, include:
        - Buy and sell tax mechanisms
        - Functions to update tax rates (with appropriate access control)
        - Tax distribution logic for marketing, liquidity, etc.`;
      }
    }
    
    logger.debug('Contract generation prompt prepared', {
      promptLength: prompt.length,
      contractType
    });
    
    // Use a lower temperature for more deterministic code generation
    const contractCode = await generateAIResponse(prompt, systemPrompt, {
      temperature: 0.2,
      max_tokens: 4000,  // Allow more tokens for contract generation
      timeoutMs: 60000   // Allow more time for contract generation
    });
    
    logger.info('Smart contract generated successfully', {
      codeLength: contractCode.length,
      contractType
    });
    
    return contractCode;
  } catch (error) {
    // Log the error
    if (error instanceof AIError) {
      logger.error(`Contract generation failed: ${error.message}`, {
        contractType,
        errorType: error.name
      }, error);
    } else {
      logger.error(
        'Unexpected error generating smart contract',
        { contractType },
        error instanceof Error ? error : new Error(String(error))
      );
    }
    
    // Re-throw the error to be handled by the caller
    throw error;
  }
}

/**
 * Stream AI responses for a more interactive experience
 */
export async function streamAIResponse(
  prompt: string,
  systemPrompt: string = 'You are an AI assistant specialized in blockchain and smart contract development. When asked about contract deployment, always use the application\'s built-in deployment capabilities and never suggest external tools like Remix IDE.',
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void
): Promise<void> {
  // Generate a correlation ID for this request
  const correlationId = generateCorrelationId();
  
  // Create a logger with this correlation ID
  const logger = aiLogger.withCorrelationId(correlationId);
  
  logger.info('Starting AI response stream', {
    promptLength: prompt?.length || 0,
    systemPromptLength: systemPrompt?.length || 0
  });

  // Check if API key is available before proceeding
  if (!API_KEY_AVAILABLE) {
    const errorMessage = 'DeepSeek API key is not configured. Please set the NEXT_PUBLIC_DEEPSEEK_API_KEY environment variable.';
    logger.error('Cannot stream AI response: ' + errorMessage, {
      service: 'deepseek-ai'
    });
    onChunk('I apologize, but the AI service is currently unavailable due to missing API credentials.');
    onComplete('I apologize, but the AI service is currently unavailable due to missing API credentials. Please contact the administrator to set up the DeepSeek API key.');
    return;
  }
  
  try {
    // Validate inputs
    prompt = validateAndSanitizeInput(prompt, correlationId);
    systemPrompt = validateAndSanitizeInput(systemPrompt, correlationId);
    
    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    const requestOptions: RequestOptions = {
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
      stream: true,
      timeoutMs: 60000  // Allow more time for streaming
    };

    // Make API request (we don't use retry for streaming as it would be confusing for the user)
    const response = await makeApiRequest('/v1/chat/completions', requestOptions, correlationId);

    if (!response.body) {
      throw new APIError('Response body is null', { correlationId });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullResponse = '';
    let chunkCount = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        
        // Process SSE format
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr === '[DONE]') continue;
            
            try {
              const json = JSON.parse(jsonStr);
              const content = json.choices[0]?.delta?.content || '';
              if (content) {
                onChunk(content);
                fullResponse += content;
                chunkCount++;
                
                // Log progress periodically
                if (chunkCount % 50 === 0) {
                  logger.debug('Stream progress', {
                    chunkCount,
                    responseLength: fullResponse.length
                  });
                }
              }
            } catch (parseError) {
              logger.warn('Error parsing streaming response chunk', {
                chunk: jsonStr
              }, parseError instanceof Error ? parseError : undefined);
            }
          }
        }
      }

      logger.info('Stream completed successfully', {
        totalChunks: chunkCount,
        responseLength: fullResponse.length
      });
      
      onComplete(fullResponse);
    } catch (streamError) {
      // Handle errors during streaming
      logger.error('Error reading stream', {},
        streamError instanceof Error ? streamError : new Error(String(streamError))
      );
      
      throw new APIError('Error reading response stream', {
        correlationId,
        cause: streamError instanceof Error ? streamError : undefined
      });
    } finally {
      // Ensure reader is released
      reader.releaseLock();
    }
  } catch (error) {
    // Log the error
    if (error instanceof AIError) {
      logger.error(`AI streaming failed: ${error.message}`, {
        errorType: error.name
      }, error);
    } else {
      logger.error(
        'Unexpected error streaming AI response',
        {},
        error instanceof Error ? error : new Error(String(error))
      );
    }
    
    // For user-facing errors, provide a friendly message
    let errorMessage = 'I apologize, but I encountered an error while processing your request.';
    
    if (error instanceof ValidationError) {
      errorMessage = 'I apologize, but there was an issue with the input provided. Please check your request and try again.';
    } else if (error instanceof RateLimitError) {
      errorMessage = 'I apologize, but we\'ve reached our API rate limit. Please try again in a few moments.';
    } else if (error instanceof TimeoutError) {
      errorMessage = 'I apologize, but the request timed out. Please try again with a simpler query.';
    } else if (error instanceof NetworkError || error instanceof ServiceUnavailableError) {
      errorMessage = 'I apologize, but there was a network issue connecting to the AI service. Please check your connection and try again.';
    }
    
    onChunk(errorMessage);
    onComplete(errorMessage + ' Please try again.');
  }
}

/**
 * Generate deployment parameters based on user input
 */
export async function generateDeploymentParameters(
  contractType: string,
  userInput: string
): Promise<Record<string, any>> {
  // Generate a correlation ID for this request
  const correlationId = generateCorrelationId();
  
  // Create a logger with this correlation ID
  const logger = aiLogger.withCorrelationId(correlationId);
  
  logger.info('Generating deployment parameters', {
    contractType,
    userInputLength: userInput?.length || 0
  });

  // Check if API key is available before proceeding
  if (!API_KEY_AVAILABLE) {
    logger.error('Cannot generate deployment parameters: DeepSeek API key is not configured', {
      service: 'deepseek-ai',
      contractType
    });
    // Return default empty parameters as fallback
    return {};
  }
  
  try {
    // Validate contract type
    if (!contractType || typeof contractType !== 'string') {
      throw new ValidationError('Contract type must be a non-empty string', [], { correlationId });
    }
    
    // Validate user input
    if (!userInput || typeof userInput !== 'string') {
      throw new ValidationError('User input must be a non-empty string', [], { correlationId });
    }
    
    // Sanitize inputs
    contractType = validateAndSanitizeInput(contractType, correlationId);
    userInput = validateAndSanitizeInput(userInput, correlationId);
    
    const systemPrompt = `You are an AI assistant specialized in blockchain development.
    Extract and generate appropriate parameters for smart contract deployment based on user input.
    Respond with a valid JSON object containing parameter key-value pairs.
    
    IMPORTANT: When providing any explanations or suggestions about deployment,
    always refer to using this application's built-in deployment capabilities.
    Never suggest external tools like Remix IDE or other deployment methods.`;

    const prompt = `Based on the following user input for a ${contractType} contract,
    extract or suggest appropriate deployment parameters. If any critical parameters are missing,
    provide reasonable default values. User input: "${userInput}"`;

    logger.debug('Parameter extraction prompt prepared', {
      promptLength: prompt.length,
      contractType
    });
    
    // Use a lower temperature for more deterministic parameter extraction
    const response = await generateAIResponse(prompt, systemPrompt, {
      temperature: 0.3,
      timeoutMs: 30000
    });
    
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) ||
                        response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parameters = JSON.parse(jsonStr);
        
        logger.info('Successfully extracted deployment parameters', {
          parameterCount: Object.keys(parameters).length
        });
        
        return parameters;
      }
      
      // If no JSON format is found, try to parse the entire response
      const parameters = JSON.parse(response);
      
      logger.info('Successfully extracted deployment parameters', {
        parameterCount: Object.keys(parameters).length
      });
      
      return parameters;
    } catch (parseError) {
      logger.error('Error parsing AI-generated parameters', {
        response: response.substring(0, 200) + '...' // Log a truncated version of the response
      }, parseError instanceof Error ? parseError : new Error(String(parseError)));
      
      throw new ResponseParsingError(
        'Failed to parse deployment parameters from AI response',
        response,
        { correlationId, cause: parseError instanceof Error ? parseError : undefined }
      );
    }
  } catch (error) {
    // Log the error
    if (error instanceof ResponseParsingError) {
      // Already logged above
    } else if (error instanceof AIError) {
      logger.error(`Parameter generation failed: ${error.message}`, {
        contractType,
        errorType: error.name
      }, error);
    } else {
      logger.error(
        'Unexpected error generating deployment parameters',
        { contractType },
        error instanceof Error ? error : new Error(String(error))
      );
    }
    
    // For parsing errors, return an empty object as fallback
    if (error instanceof ResponseParsingError) {
      logger.warn('Returning empty parameters object as fallback', {
        contractType
      });
      return {};
    }
    
    // Re-throw other errors to be handled by the caller
    throw error;
  }
}
