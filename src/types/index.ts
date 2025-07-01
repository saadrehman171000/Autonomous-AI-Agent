export interface Tweet {
  id: string;
  text: string;
  authorId: string;
  createdAt: Date;
  conversationId?: string;
  inReplyToUserId?: string;
  referencedTweets?: {
    type: 'replied_to' | 'quoted' | 'retweeted';
    id: string;
  }[];
}

export interface User {
  id: string;
  username: string;
  name: string;
  description?: string;
  metrics?: {
    followersCount: number;
    followingCount: number;
    tweetCount: number;
  };
}

export interface Conversation {
  id: string;
  tweets: Tweet[];
  participants: User[];
  context: string[];
  lastInteraction: Date;
}

export interface WalletTransaction {
  id: string;
  from: string;
  to: string;
  amount: string;
  currency: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
}

export interface AgentConfig {
  twitter: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
    bearerToken: string;
  };
  llm: {
    provider: 'claude' | 'openrouter';
    apiKey: string;
    model: string;
    maxTokens: number;
  };
  wallet: {
    network: string;
    rpcUrl: string;
    privateKey: string;
  };
  monitoring: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableMetrics: boolean;
  };
}

export interface AgentState {
  conversations: Map<string, Conversation>;
  lastCheckedMentionId?: string;
  userInteractions: Map<string, {
    userId: string;
    lastInteraction: Date;
    interactionCount: number;
    transactions: WalletTransaction[];
  }>;
}
