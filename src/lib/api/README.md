# Frontend API Client

This API client library replaces direct Firebase calls with API calls to our Express backend. It provides a clean, consistent interface for React components to interact with backend services.

## Architecture

```
src/lib/api/
├── config.ts             # API configuration (base URL, endpoints)
├── auth.ts               # Authentication utilities
├── client.ts             # Core API client with request handling
├── endpoints/            # Endpoint-specific implementations
│   └── quests.ts         # Quest-related API calls
├── sse/                  # Server-Sent Events implementation
│   ├── client.ts         # SSE client
│   └── events.ts         # Event types and handlers
└── index.ts              # Main export file
```

## Features

- **Unified API Interface**: Consistent patterns for API calls
- **Authentication**: Automatic token handling
- **Error Handling**: Standardized error responses
- **Real-time Updates**: SSE support for live data
- **Type Safety**: Full TypeScript support

## Usage Examples

### Basic API Call

```typescript
import { apiClient } from '@/lib/api';

// Make a GET request
const quests = await apiClient.get('/api/quests');

// Make a POST request with authentication
const result = await apiClient.post(
  '/api/quests',
  { title: 'New Quest', reward: '100' },
  { requireAuth: true }
);
```

### Using Endpoint Modules

```typescript
import { QuestsApi } from '@/lib/api';

// Get quests with filters
const quests = await QuestsApi.getQuests({
  category: 'defi',
  difficulty: 'medium'
});

// Create a new quest
const newQuest = await QuestsApi.createQuest({
  title: 'Complete a Swap',
  description: 'Swap tokens on our DEX',
  reward: 100,
  difficulty: 'easy',
  category: 'defi',
  requirements: ['Connect wallet', 'Swap any tokens']
});
```

### Real-time Updates with SSE

```typescript
import { sseClient, SSEEventType } from '@/lib/api';

// Connect to SSE endpoint
sseClient.connect();

// Subscribe to quest events
const unsubscribe = sseClient.subscribe(
  SSEEventType.QUEST_UPDATED,
  (event) => {
    console.log('Quest updated:', event.data.quest);
    // Update UI or state
  }
);

// Clean up on unmount
useEffect(() => {
  return () => {
    unsubscribe();
    sseClient.disconnect();
  };
}, []);
```

### Using React Hooks

```typescript
import { useQuestsApi } from '@/hooks/useQuestsApi';

function QuestComponent() {
  const {
    quests,
    loading,
    error,
    fetchQuests,
    createQuest,
    updateQuest,
    deleteQuest
  } = useQuestsApi();

  useEffect(() => {
    fetchQuests({ category: 'social' });
  }, [fetchQuests]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {quests.map(quest => (
        <div key={quest.id}>{quest.title}</div>
      ))}
    </div>
  );
}
```

## Authentication

The API client automatically handles authentication tokens from Firebase Auth:

```typescript
import { auth } from '@/lib/api';

// Check if user is authenticated
const isLoggedIn = auth.isAuthenticated();

// Get current user ID
const userId = auth.getCurrentUserId();

// Check if user is admin
const isAdmin = await auth.isAdmin();
```

## Error Handling

The API client provides standardized error handling:

```typescript
try {
  const quests = await QuestsApi.getQuests();
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.status}: ${error.message}`);
    
    // Handle specific error codes
    if (error.status === 401) {
      // Unauthorized - redirect to login
    } else if (error.status === 403) {
      // Forbidden - show permission error
    }
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Extending the API Client

To add support for new endpoints:

1. Add endpoint definitions in `config.ts`
2. Create a new endpoint module in the `endpoints/` directory
3. Export the new module in `index.ts`

Example for a new "Users" endpoint:

```typescript
// In config.ts
export const ENDPOINTS = {
  // ...existing endpoints
  USERS: {
    BASE: '/api/users',
    BY_ID: (id: string) => `/api/users/${id}`,
    PROFILE: '/api/users/profile'
  }
};

// In endpoints/users.ts
import apiClient from '../client';
import { ENDPOINTS } from '../config';

export const UsersApi = {
  getUsers: async () => {
    return await apiClient.get(ENDPOINTS.USERS.BASE, { requireAuth: true });
  },
  // ...other methods
};

// In index.ts
import UsersApi from './endpoints/users';

export {
  // ...existing exports
  UsersApi
};