import { Timestamp } from 'firebase/firestore';

export interface CompletedQuest {
  questId: string;             // ID of the completed quest
  completedAt: Timestamp;      // When the quest was completed
  xpReward: number;            // XP reward for completing the quest
}

export interface SocialShare {
  questId: string;             // ID of the shared quest
  sharedAt: Timestamp;         // When the quest was shared
  platform: 'twitter' | 'discord' | 'telegram' | 'other'; // Platform where quest was shared
  url?: string;                // URL of the share (if available)
}

export interface User {
  id: string;                  // User ID (normalized wallet address)
  address: string;             // Normalized wallet address
  walletAddress?: string;      // Original wallet address
  displayName?: string;        // User display name
  bio?: string;                // User bio
  profilePicture?: string;     // Profile picture URL
  xp: number;                  // Total XP earned
  level: number;               // Current level based on XP
  completedQuests: CompletedQuest[]; // Array of completed quests
  followers?: string[];        // Array of user IDs who follow this user
  following?: string[];        // Array of user IDs this user follows
  sharedQuests?: SocialShare[]; // Array of quests shared on social media
  tokenBalances: {             // Token balances by token address
    [tokenAddress: string]: number;
  };
  projectTokenBalances?: {     // Token balances by project and token
    [projectId: string]: {
      [tokenAddress: string]: number;
    }
  };
  tokenSymbols: {              // Token symbols by token address
    [tokenAddress: string]: string;
  };
  tokenDecimals: {             // Token decimals by token address
    [tokenAddress: string]: number;
  };
  isAdmin?: boolean;           // Whether user is an admin
  profileComplete?: boolean;   // Whether profile is complete
  mobileProfileComplete?: boolean; // Whether mobile profile is complete
  createdAt: Timestamp;        // Account creation timestamp
  updatedAt: Timestamp;        // Last update timestamp
  lastMobileAccess?: Timestamp; // Last mobile access timestamp
  lastDesktopAccess?: Timestamp; // Last desktop access timestamp
  deviceType?: "mobile" | "desktop"; // Last device type used
}

export interface UserUpdateParams {
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  profileComplete?: boolean;
  mobileProfileComplete?: boolean;
  deviceType?: "mobile" | "desktop";
}
