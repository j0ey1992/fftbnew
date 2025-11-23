import { SSEEventType, SSEEvent } from './client';
import { Quest } from '@/types';
import { Submission } from '@/types/submission';

/**
 * Quest event data
 */
export interface QuestEventData {
  quest: Quest;
  action: 'created' | 'updated' | 'deleted';
  changedFields?: string[];
}

/**
 * Submission event data
 */
export interface SubmissionEventData {
  submission: Submission;
  questId: string;
  action: 'created' | 'updated' | 'status_changed';
  previousStatus?: string;
}

/**
 * User activity event data
 */
export interface UserActivityEventData {
  userId: string;
  action: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * System notification event data
 */
export interface SystemNotificationEventData {
  title: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
  link?: string;
  expiresAt?: string;
}

/**
 * Type guard for quest events
 * @param event SSE event
 * @returns Boolean indicating if event is a quest event
 */
export function isQuestEvent(event: SSEEvent): event is SSEEvent<QuestEventData> {
  // Check if the event type is one of the quest event types
  const isCorrectType = (
    event.type === SSEEventType.QUEST_CREATED ||
    event.type === SSEEventType.QUEST_UPDATED ||
    event.type === SSEEventType.QUEST_DELETED
  );
  
  // If it's not a quest event type, return false immediately
  if (!isCorrectType) return false;
  
  // For quest events, we'll be more lenient and try to extract the data we need
  try {
    // Convert the event data to a string and back to ensure we're working with a clean object
    const rawData = JSON.stringify(event.data);
    const parsedData = JSON.parse(rawData);
    
    console.log('Parsed event data:', parsedData);
    
    // Check if we have a quest object either directly or nested
    let quest = null;
    let action = null;
    
    if (parsedData && typeof parsedData === 'object') {
      // Try to find the quest object
      if (parsedData.quest && typeof parsedData.quest === 'object') {
        quest = parsedData.quest;
      } else if (parsedData.data && parsedData.data.quest && typeof parsedData.data.quest === 'object') {
        quest = parsedData.data.quest;
      }
      
      // Try to find the action
      if (parsedData.action && typeof parsedData.action === 'string') {
        action = parsedData.action;
      } else if (parsedData.data && parsedData.data.action && typeof parsedData.data.action === 'string') {
        action = parsedData.data.action;
      }
    }
    
    // If we found both quest and action, reconstruct the event data
    if (quest && action) {
      // Modify the event data to match the expected structure
      event.data = {
        quest,
        action,
        changedFields: parsedData.changedFields || []
      };
      
      console.log('Reconstructed event data:', event.data);
      return true;
    }
    
    console.warn('Could not extract quest and action from event data:', parsedData);
    return false;
  } catch (error) {
    console.error('Error parsing quest event data:', error);
    return false;
  }
}

/**
 * Type guard for submission events
 * @param event SSE event
 * @returns Boolean indicating if event is a submission event
 */
export function isSubmissionEvent(event: SSEEvent): event is SSEEvent<SubmissionEventData> {
  return (
    event.type === SSEEventType.SUBMISSION_CREATED ||
    event.type === SSEEventType.SUBMISSION_UPDATED
  );
}

/**
 * Type guard for user activity events
 * @param event SSE event
 * @returns Boolean indicating if event is a user activity event
 */
export function isUserActivityEvent(event: SSEEvent): event is SSEEvent<UserActivityEventData> {
  return event.type === SSEEventType.USER_ACTIVITY;
}

/**
 * Type guard for system notification events
 * @param event SSE event
 * @returns Boolean indicating if event is a system notification event
 */
export function isSystemNotificationEvent(event: SSEEvent): event is SSEEvent<SystemNotificationEventData> {
  return event.type === SSEEventType.SYSTEM_NOTIFICATION;
}

/**
 * Default event handlers for common SSE events
 */
export const defaultEventHandlers = {
  /**
   * Handle quest created event
   * @param event Quest created event
   */
  onQuestCreated: (event: SSEEvent<QuestEventData>) => {
    console.log('Quest created:', event.data.quest);
    // Implement cache update or UI notification logic here
  },

  /**
   * Handle quest updated event
   * @param event Quest updated event
   */
  onQuestUpdated: (event: SSEEvent<QuestEventData>) => {
    console.log('Quest updated:', event.data.quest, 'Changed fields:', event.data.changedFields);
    // Implement cache update or UI notification logic here
  },

  /**
   * Handle quest deleted event
   * @param event Quest deleted event
   */
  onQuestDeleted: (event: SSEEvent<QuestEventData>) => {
    console.log('Quest deleted:', event.data.quest.id);
    // Implement cache update or UI notification logic here
  },

  /**
   * Handle submission created event
   * @param event Submission created event
   */
  onSubmissionCreated: (event: SSEEvent<SubmissionEventData>) => {
    console.log('Submission created:', event.data.submission);
    // Implement cache update or UI notification logic here
  },

  /**
   * Handle submission updated event
   * @param event Submission updated event
   */
  onSubmissionUpdated: (event: SSEEvent<SubmissionEventData>) => {
    console.log('Submission updated:', event.data.submission);
    // Implement cache update or UI notification logic here
  },

  /**
   * Handle user activity event
   * @param event User activity event
   */
  onUserActivity: (event: SSEEvent<UserActivityEventData>) => {
    console.log('User activity:', event.data);
    // Implement UI notification logic here
  },

  /**
   * Handle system notification event
   * @param event System notification event
   */
  onSystemNotification: (event: SSEEvent<SystemNotificationEventData>) => {
    console.log('System notification:', event.data);
    // Implement UI notification logic here
  }
};

/**
 * Register default event handlers with an SSE client
 * @param sseClient SSE client instance
 * @param handlers Custom event handlers to override defaults
 */
export function registerDefaultEventHandlers(
  sseClient: any,
  handlers: Partial<typeof defaultEventHandlers> = {}
): () => void {
  const mergedHandlers = { ...defaultEventHandlers, ...handlers };
  
  const unsubscribers = [
    sseClient.subscribe(SSEEventType.QUEST_CREATED, mergedHandlers.onQuestCreated),
    sseClient.subscribe(SSEEventType.QUEST_UPDATED, mergedHandlers.onQuestUpdated),
    sseClient.subscribe(SSEEventType.QUEST_DELETED, mergedHandlers.onQuestDeleted),
    sseClient.subscribe(SSEEventType.SUBMISSION_CREATED, mergedHandlers.onSubmissionCreated),
    sseClient.subscribe(SSEEventType.SUBMISSION_UPDATED, mergedHandlers.onSubmissionUpdated),
    sseClient.subscribe(SSEEventType.USER_ACTIVITY, mergedHandlers.onUserActivity),
    sseClient.subscribe(SSEEventType.SYSTEM_NOTIFICATION, mergedHandlers.onSystemNotification)
  ];
  
  // Return combined unsubscribe function
  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe());
  };
}