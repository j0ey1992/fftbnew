import { SSE_ENDPOINT } from '../config';
import { getAuthToken } from '../auth';

/**
 * SSE event types
 */
export enum SSEEventType {
  QUEST_CREATED = 'quest_created',
  QUEST_UPDATED = 'quest_updated',
  QUEST_DELETED = 'quest_deleted',
  SUBMISSION_CREATED = 'submission_created',
  SUBMISSION_UPDATED = 'submission_updated',
  USER_ACTIVITY = 'user_activity',
  SYSTEM_NOTIFICATION = 'system_notification',
  // NFT Staking Events
  NFT_STAKING_UPDATED = 'nft_staking_updated',
  NFT_COLLECTION_UPDATED = 'nft_collection_updated',
  STAKING_REWARDS_UPDATED = 'staking_rewards_updated',
  NFT_STAKED = 'nft_staked',
  NFT_UNSTAKED = 'nft_unstaked',
  REWARDS_CLAIMED = 'rewards_claimed',
}

/**
 * SSE event data
 */
export interface SSEEvent<T = any> {
  type: SSEEventType;
  data: T;
  timestamp: string;
}

/**
 * SSE connection options
 */
export interface SSEConnectionOptions {
  endpoint: string;
  withCredentials?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

/**
 * SSE event handler function type
 */
export type SSEEventHandler<T = any> = (event: SSEEvent<T>) => void;

/**
 * SSE client for real-time updates
 */
export class SSEClient {
  private eventSource: EventSource | null = null;
  private endpoint: string;
  private withCredentials: boolean;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts: number = 0;
  private eventHandlers: Map<string, Set<SSEEventHandler>> = new Map();
  private isConnecting: boolean = false;
  private authToken: string | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;

  // Bound event handlers
  private boundHandleOpen: (event: Event) => void;
  private boundHandleError: (event: Event) => void;
  private boundHandleMessage: (event: MessageEvent) => void;
  private boundEventHandlers: Map<string, (event: Event) => void> = new Map();

  /**
   * Create a new SSE client
   * @param options SSE connection options
   */
  constructor(options: SSEConnectionOptions) {
    this.endpoint = options.endpoint;
    this.withCredentials = options.withCredentials ?? true;
    this.reconnectInterval = options.reconnectInterval ?? 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 10;

    // Pre-bind event handlers to avoid issues with 'this' context
    this.boundHandleOpen = this.handleOpen.bind(this);
    this.boundHandleError = this.handleError.bind(this);
    this.boundHandleMessage = this.handleMessage.bind(this);
  }

  /**
   * Connect to the SSE endpoint
   * @returns Promise that resolves when connected
   */
  async connect(): Promise<void> {
    if (this.eventSource || this.isConnecting) {
      console.log('SSE: Already connected or connecting, skipping');
      return;
    }

    this.isConnecting = true;

    try {
      // Get auth token
      this.authToken = await getAuthToken();
      
      // Build URL with auth token if available
      let url = this.endpoint;
      if (this.authToken) {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}token=${this.authToken}`;
      }

      console.log('Connecting to SSE endpoint:', url);

      // Create EventSource
      this.eventSource = new EventSource(url, {
        withCredentials: this.withCredentials
      });

      // Set up event listeners using pre-bound handlers
      this.eventSource.onopen = this.boundHandleOpen;
      this.eventSource.onerror = this.boundHandleError;
      this.eventSource.onmessage = this.boundHandleMessage;

      // Set up specific event listeners with proper cleanup tracking
      Object.values(SSEEventType).forEach(eventType => {
        if (this.eventSource) {
          const handler = (event: Event) => this.handleEvent(eventType, event as MessageEvent);
          this.boundEventHandlers.set(eventType, handler);
          this.eventSource.addEventListener(eventType, handler);
        }
      });

      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error('Error connecting to SSE endpoint:', error);
      this.reconnect();
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Disconnect from the SSE endpoint
   */
  disconnect(): void {
    // Cancel any pending reconnect
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.eventSource) {
      // Remove all event listeners to prevent memory leaks
      this.eventSource.onopen = null;
      this.eventSource.onerror = null;
      this.eventSource.onmessage = null;
      
      // Remove specific event listeners using the stored references
      this.boundEventHandlers.forEach((handler, eventType) => {
        if (this.eventSource) {
          this.eventSource.removeEventListener(eventType, handler);
        }
      });
      
      // Clear the bound handlers map
      this.boundEventHandlers.clear();
      
      this.eventSource.close();
      this.eventSource = null;
    }
    
    // Clear all subscriptions to prevent memory leaks
    this.eventHandlers.clear();
    
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  /**
   * Subscribe to an event type
   * @param eventType Event type to subscribe to
   * @param handler Event handler function
   * @returns Unsubscribe function
   */
  subscribe<T = any>(eventType: SSEEventType, handler: SSEEventHandler<T>): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }

    const handlers = this.eventHandlers.get(eventType)!;
    handlers.add(handler as SSEEventHandler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        handlers.delete(handler as SSEEventHandler);
        if (handlers.size === 0) {
          this.eventHandlers.delete(eventType);
        }
      }
    };
  }

  /**
   * Subscribe to multiple event types
   * @param eventTypes Array of event types to subscribe to
   * @param handler Event handler function
   * @returns Unsubscribe function
   */
  subscribeToMany<T = any>(eventTypes: SSEEventType[], handler: SSEEventHandler<T>): () => void {
    const unsubscribers = eventTypes.map(eventType => this.subscribe(eventType, handler));
    
    // Return combined unsubscribe function
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }

  /**
   * Check if connected to SSE endpoint
   * @returns Boolean indicating if connected
   */
  isConnected(): boolean {
    return !!this.eventSource && this.eventSource.readyState === EventSource.OPEN;
  }

  /**
   * Handle SSE open event
   */
  private handleOpen(_event: Event): void {
    console.log('Connected to SSE endpoint');
    this.reconnectAttempts = 0;
  }

  /**
   * Handle SSE error event
   * @param error Error event
   */
  private handleError(error: Event): void {
    // Extract more information from the error event
    const errorInfo = {
      type: error.type,
      target: error.target ? {
        url: (error.target as any).url,
        readyState: (error.target as any).readyState,
        withCredentials: (error.target as any).withCredentials
      } : 'No target',
      timeStamp: error.timeStamp,
      eventPhase: error.eventPhase,
      bubbles: error.bubbles,
      cancelable: error.cancelable,
      composed: error.composed,
      currentTarget: error.currentTarget ? 'Has currentTarget' : 'No currentTarget',
      defaultPrevented: error.defaultPrevented,
      returnValue: error.returnValue,
      srcElement: error.srcElement ? 'Has srcElement' : 'No srcElement'
    };
    
    console.error('SSE connection error details:', errorInfo);
    
    // Log connection configuration
    console.error('SSE connection configuration:', {
      endpoint: this.endpoint,
      readyState: this.eventSource?.readyState,
      withCredentials: this.withCredentials,
      reconnectAttempts: this.reconnectAttempts,
      hasAuthToken: !!this.authToken,
      authTokenLength: this.authToken ? this.authToken.length : 0
    });
    
    // Close and reconnect
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    this.reconnect();
  }

  /**
   * Handle SSE message event
   * @param event Message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      this.notifyHandlers('message', data);
    } catch (error) {
      console.error('Error parsing SSE message:', error);
    }
  }

  /**
   * Handle specific SSE event
   * @param eventType Event type
   * @param event Event object
   */
  private handleEvent(eventType: string, event: MessageEvent): void {
    try {
      console.log(`SSE event received (${eventType}):`, event.data);
      const data = JSON.parse(event.data);
      console.log(`SSE event parsed data (${eventType}):`, data);
      this.notifyHandlers(eventType, data);
    } catch (error) {
      console.error(`Error parsing SSE ${eventType} event:`, error);
    }
  }

  /**
   * Notify event handlers of an event
   * @param eventType Event type
   * @param data Event data
   */
  private notifyHandlers(eventType: string, data: any): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const event: SSEEvent = {
        type: eventType as SSEEventType,
        data,
        timestamp: new Date().toISOString()
      };
      
      console.log(`Notifying ${handlers.size} handlers for event type: ${eventType}`, event);
      
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in SSE event handler for ${eventType}:`, error);
          console.error('Event data that caused the error:', JSON.stringify(event, null, 2));
          console.error('Error details:', error);
        }
      });
    }
  }

  /**
   * Reconnect to the SSE endpoint
   */
  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Maximum SSE reconnect attempts (${this.maxReconnectAttempts}) reached`);
      return;
    }

    this.reconnectAttempts++;
    
    console.log(`Reconnecting to SSE endpoint (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    // Clear any existing timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectInterval);
  }
}

// Create and export default SSE client instance
const sseClient = new SSEClient({
  endpoint: SSE_ENDPOINT
});

export default sseClient;