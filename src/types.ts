export interface Tweet {
  readonly id: string;
  readonly text: string;
  readonly authorId: string;
  readonly createdAt: Date;
  readonly conversationId?: string;
  readonly referencedTweets?: {
    readonly type: 'replied_to' | 'quoted' | 'retweeted';
    readonly id: string;
  }[];
}

export interface User {
  readonly id: string;
  readonly username: string;
  readonly name: string;
  readonly description?: string;
  readonly metrics?: {
    readonly followersCount: number;
    readonly followingCount: number;
    readonly tweetCount: number;
  };
}

export interface RateLimit {
  readonly limit: number;
  readonly remaining: number;
  readonly reset: number;
}

export interface TwitterResponse {
  readonly mentions: Tweet[];
  readonly rateLimit: RateLimit;
}

export interface WalletTransaction {
  readonly id?: string;
  readonly hash: string;
  readonly from: string;
  readonly to: string;
  readonly value: string;
  readonly amount?: string;
  readonly currency?: string;
  readonly timestamp: Date;
  readonly status?: 'pending' | 'confirmed' | 'failed' | 'completed';
}

export interface AgentConfig {
  readonly twitter: {
    readonly apiKey: string;
    readonly apiSecret: string;
    readonly accessToken: string;
    readonly accessTokenSecret: string;
    readonly bearerToken: string;
  };
  readonly llm: {
    readonly apiKey: string;
    readonly model: string;
    readonly maxTokens: number;
    readonly provider?: string;
  };
  readonly wallet: {
    readonly privateKey: string;
    readonly rpcUrl: string;
    readonly network?: string;
  };
  readonly monitoring?: {
    readonly enabled: boolean;
    readonly interval: number;
    readonly logLevel?: 'debug' | 'info' | 'warn' | 'error';
    readonly enableMetrics?: boolean;
  };
}
