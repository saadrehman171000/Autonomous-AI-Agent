import { TwitterApi, TweetV2, UserV2 } from 'twitter-api-v2';
import { Tweet, User, RateLimit, TwitterResponse } from '../types';
import { logger } from '../utils/logger';

export class TwitterService {
  private client: TwitterApi;
  private userId: string = '';
  private initialized: boolean = false;
  private retryCount = 0;
  private maxRetries = 3;
  private baseDelay = 1000; // 1 second base delay
  private rateLimitDelay = 15000; // 15 seconds delay for rate limits

  constructor(
    apiKey: string,
    apiSecret: string,
    accessToken: string,
    accessTokenSecret: string,
    bearerToken: string,
  ) {
    // Initialize user client with OAuth 1.0a
    this.client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    });
    logger.info('Initialized Twitter client with OAuth 1.0a');
    
    // Test connectivity immediately
    this.testConnectivity().catch(error => {
      logger.error('Failed initial connectivity test:', error);
    });
  }

  private async testConnectivity(): Promise<void> {
    try {
      logger.info('Testing Twitter API connectivity...');
      const me = await this.client.v2.me();
      this.userId = me.data.id;
      this.initialized = true;
      logger.info('Twitter API test successful:', {
        id: me.data.id,
        username: me.data.username,
      });
    } catch (error) {
      logger.error('Twitter API connectivity test failed:', error);
      throw error;
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async handleRateLimit(error: any): Promise<void> {
    const resetTime = error.rateLimit?.reset;
    if (resetTime) {
      const now = Date.now();
      const resetDate = new Date(resetTime * 1000);
      const waitTime = Math.max(0, resetDate.getTime() - now);
      
      if (waitTime > 0 && waitTime < 900000) { // Only wait if less than 15 minutes
        logger.info(`Rate limited. Waiting ${waitTime}ms until ${resetDate}`);
        await this.delay(waitTime);
      } else {
        logger.info('Rate limit too long, using default delay');
        await this.delay(this.rateLimitDelay);
      }
    } else {
      await this.delay(this.rateLimitDelay);
    }
  }

  private isApiError(error: any): boolean {
    return error?.errors || error?.code || error?.message?.includes('API');
  }

  private handleApiError(error: any): void {
    if (error?.errors && Array.isArray(error.errors)) {
      for (const apiError of error.errors) {
        if (apiError.code === 453) {
          logger.error('Access level error: You need elevated access to use this endpoint');
          throw new Error('Twitter API access level insufficient. Please upgrade your Twitter API access.');
        }
        logger.error(`Twitter API Error [${apiError.code}]: ${apiError.message}`);
      }
    }
    
    if (error?.code === 403) {
      logger.error('Forbidden: Check your Twitter API permissions and access level');
      throw new Error('Twitter API forbidden. Check permissions.');
    }
    
    if (error?.code === 401) {
      logger.error('Unauthorized: Check your Twitter API credentials');
      throw new Error('Twitter API unauthorized. Check credentials.');
    }
  }

  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Handle X API specific errors
        if (this.isApiError(error)) {
          this.handleApiError(error);
        }
        
        if (error.code === 429 || (typeof error.message === 'string' && error.message.includes('Rate limit'))) {
          await this.handleRateLimit(error);
        } else {
          throw error;
        }
      }
    }
    
    throw lastError;
  }

  private async initializeUserId(): Promise<void> {
    try {
      if (!this.userId) {
        logger.info('Initializing Twitter user ID...');
        const me = await this.retryOperation(() => this.client.v2.me());
        this.userId = me.data.id;
        logger.info(`Initialized Twitter user ID: ${this.userId} (@${me.data.username})`);
        this.initialized = true;
      }
    } catch (error) {
      logger.error('Failed to initialize user ID:', error);
      throw error;
    }
  }

  async getMentionsWithRateLimit(sinceId?: string): Promise<TwitterResponse> {
    try {
      if (!this.initialized) {
        await this.initializeUserId();
      }
      
      logger.info('Fetching mentions...', { sinceId });
      const response = await this.retryOperation(() => 
        this.client.v2.userMentionTimeline(this.userId, {
          since_id: sinceId,
          expansions: ['referenced_tweets.id', 'in_reply_to_user_id', 'author_id'],
          'tweet.fields': ['created_at', 'conversation_id', 'referenced_tweets', 'author_id'],
          'user.fields': ['id', 'name', 'username'],
          max_results: 5, // Minimum allowed by Twitter API
        })
      );

      // The response is a paginator object, extract tweets
      const tweetsArray = response.tweets || response.data || [];
      
      if (!Array.isArray(tweetsArray)) {
        logger.warn('No mentions found or invalid response format');
        return { 
          mentions: [], 
          rateLimit: response.rateLimit as RateLimit 
        };
      }

      const tweets = tweetsArray.map((tweet: TweetV2) => ({
        id: tweet.id,
        text: tweet.text,
        authorId: tweet.author_id || '',
        createdAt: tweet.created_at ? new Date(tweet.created_at) : new Date(),
        conversationId: tweet.conversation_id,
        referencedTweets: tweet.referenced_tweets?.map(ref => ({
          type: ref.type as 'replied_to' | 'quoted' | 'retweeted',
          id: ref.id,
        })),
      }));

      logger.info(`Found ${tweets.length} mention(s) for testing`);
      return { 
        mentions: tweets, 
        rateLimit: response.rateLimit as RateLimit 
      };
    } catch (error) {
      logger.error('Failed to fetch mentions:', error);
      throw error;
    }
  }

  async getTweetById(tweetId: string): Promise<Tweet | null> {
    return this.retryOperation(async () => {
      try {
        logger.info(`Fetching tweet by ID: ${tweetId}`);
        const tweet = await this.client.v2.singleTweet(tweetId);
        
        if (!tweet.data) {
          return null;
        }

        return {
          id: tweet.data.id,
          text: tweet.data.text,
          authorId: tweet.data.author_id || '',
          createdAt: new Date(), // Use current time if no created_at available
          conversationId: tweet.data.conversation_id
        };
      } catch (error) {
        logger.error(`Error fetching tweet ${tweetId}:`, error);
        throw error;
      }
    });
  }

  async replyToTweet(text: string, replyToTweetId: string): Promise<void> {
    return this.retryOperation(async () => {
      try {
        if (!this.initialized) {
          await this.initializeUserId();
        }
        
        logger.info(`Replying to tweet ${replyToTweetId}`);
        await this.client.v2.reply(text, replyToTweetId);
        logger.info(`Successfully replied to tweet ${replyToTweetId}`);
      } catch (error) {
        logger.error(`Error replying to tweet ${replyToTweetId}:`, error);
        throw error;
      }
    });
  }

  async getUserInfo(userId: string): Promise<User> {
    try {
      logger.info(`Fetching user info for ${userId}`);
      const response = await this.retryOperation(() =>
        this.client.v2.user(userId, {
          'user.fields': ['description', 'public_metrics', 'username'],
        })
      );

      const user: UserV2 = response.data;

      return {
        id: user.id,
        username: user.username,
        name: user.name,
        description: user.description,
        metrics: {
          followersCount: user.public_metrics?.followers_count || 0,
          followingCount: user.public_metrics?.following_count || 0,
          tweetCount: user.public_metrics?.tweet_count || 0,
        },
      };
    } catch (error) {
      logger.error('Failed to fetch user info:', error);
      throw error;
    }
  }

  async postTweet(text: string): Promise<string> {
    return this.retryOperation(async () => {
      try {
        if (!this.initialized) {
          await this.initializeUserId();
        }
        
        logger.info('Posting tweet:', { textLength: text.length });
        
        // Validate tweet length
        if (text.length > 280) {
          throw new Error(`Tweet too long: ${text.length} characters (max 280)`);
        }
        
        const result = await this.client.v2.tweet(text);
        
        if (!result.data?.id) {
          throw new Error('Failed to post tweet: No tweet ID returned');
        }
        
        logger.info(`Successfully posted tweet with ID: ${result.data.id}`);
        return result.data.id;
      } catch (error: any) {
        logger.error('Error posting tweet:', error);
        
        // Check for specific error codes
        if (error?.errors) {
          for (const apiError of error.errors) {
            if (apiError.code === 187) {
              throw new Error('Duplicate tweet: This tweet has already been posted');
            }
          }
        }
        
        throw error;
      }
    });
  }
}
