/**
 * API Client Library
 * 
 * This module exports a unified API client for interacting with the backend services.
 * It replaces direct Firebase calls with API calls to the Express backend.
 */

// Core API client
import apiClient, { ApiClient, ApiError } from './client';

// Authentication utilities
import * as auth from './auth';

// SSE client for real-time updates
import sseClient, { SSEEventType } from './sse/client';
import * as sseEvents from './sse/events';

// API endpoints
import QuestsApi from './endpoints/quests';
import { CampaignsApi } from './endpoints/campaigns';

// Re-export everything
export {
  // Core client
  apiClient,
  ApiClient,
  ApiError,
  
  // Authentication
  auth,
  
  // SSE
  sseClient,
  SSEEventType,
  sseEvents,
  
  // Endpoints
  QuestsApi,
  CampaignsApi,
};

// Default export
export default {
  client: apiClient,
  auth,
  sse: {
    client: sseClient,
    events: sseEvents,
    eventTypes: SSEEventType,
  },
  quests: QuestsApi,
  campaigns: CampaignsApi,
};