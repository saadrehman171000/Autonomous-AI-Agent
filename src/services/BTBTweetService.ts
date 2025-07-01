import { TwitterService } from './TwitterService';
import { OpenRouterService } from './OpenRouterService';
import { KnowledgeBaseService } from './KnowledgeBaseService';
import { logger } from '../utils/logger';
import { Tweet, RateLimit } from '../types';

export class BTBTweetService {
  private twitterService: TwitterService;
  private openRouterService: OpenRouterService;
  private knowledgeBaseService: KnowledgeBaseService;
  private lastProcessedTweetId?: string;
  private processedTweetIds: Set<string> = new Set(); // Track ALL replied tweets
  private isProcessing: boolean = false;
  private nextPollTime: Date = new Date();
  private defaultIntervalMs: number = 900000; // 15 minutes default

  // --- Real-time stats and feed ---
  private mentionsReplied = 0;
  private llmRequests = 0;
  private responseTimes: number[] = [];
  private feed: any[] = [];
  private recentActivity: any[] = [];
  private logs: any[] = [];
  private maxFeed = 50;
  private maxActivity = 50;
  private maxLogs = 100;

  private userCache: Record<string, string> = {};

  constructor(
    twitterService: TwitterService,
    openRouterService: OpenRouterService,
    knowledgeBaseService: KnowledgeBaseService
  ) {
    this.twitterService = twitterService;
    this.openRouterService = openRouterService;
    this.knowledgeBaseService = knowledgeBaseService;
  }

  // --- Real-time stats/feed/logs API ---
  public getStats() {
    const avgResponse = this.responseTimes.length
      ? (this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length).toFixed(2) + 'ms'
      : 'N/A';
    return {
      status: 'Running',
      mentionsReplied: this.mentionsReplied,
      mentionsChange: '+0% (live)',
      llmRequests: this.llmRequests,
      responseRate: 100,
      mentionsProcessed: `${this.mentionsReplied}/${this.mentionsReplied + 10}`,
      mentionsProcessedPercent: Math.min(100, (this.mentionsReplied / (this.mentionsReplied + 10)) * 100),
      responseTimeAvg: avgResponse,
      responseTimePercent: 100,
      apiUsage: `${this.llmRequests}/1000`,
      apiUsagePercent: Math.min(100, (this.llmRequests / 1000) * 100),
      recentActivity: [...this.recentActivity],
    };
  }

  public getFeed() {
    return [...this.feed];
  }

  public getRecentLogs() {
    return [...this.logs];
  }

  private pushFeed(item: any) {
    this.feed.unshift(item);
    if (this.feed.length > this.maxFeed) this.feed.pop();
  }

  private pushActivity(item: any) {
    this.recentActivity.unshift(item);
    if (this.recentActivity.length > this.maxActivity) this.recentActivity.pop();
  }

  private pushLog(item: any) {
    this.logs.unshift(item);
    if (this.logs.length > this.maxLogs) this.logs.pop();
  }

  private extractQuestion(tweetText: string): string {
    // Remove $BTB mention, @mentions, and any URLs
    const cleanText = tweetText
      .replace(/\$BTB/gi, '')
      .replace(/@\w+/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();
    return cleanText;
  }

  private updateNextPollTime(rateLimit?: RateLimit): void {
    // Always use a short delay (15 seconds) after a rate limit for immediate replies
    this.nextPollTime = new Date(Date.now() + 15000); // 15 seconds
    logger.info('Next poll time set to 15 seconds from now due to rate limit', {
      nextPoll: this.nextPollTime.toISOString(),
    });
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async getUsername(authorId: string): Promise<string> {
    if (this.userCache[authorId]) return this.userCache[authorId];
    try {
      const user = await this.twitterService.getUserInfo(authorId);
      this.userCache[authorId] = user.username;
      return user.username;
    } catch {
      return authorId;
    }
  }

  async processBTBTweets(): Promise<void> {
    if (this.isProcessing) {
      logger.info('Already processing tweets, skipping...');
      return;
    }

    try {
      this.isProcessing = true;
      logger.info('Processing $BTB tweets...', { lastProcessedTweetId: this.lastProcessedTweetId });

      // Get mentions since last processed tweet
      const { mentions, rateLimit } = await this.twitterService.getMentionsWithRateLimit(this.lastProcessedTweetId);
      
      // Update next poll time based on rate limit info
      this.updateNextPollTime(rateLimit);

      // Log all mentions for debugging
      logger.info(`Total mentions received: ${mentions.length}`);
      mentions.forEach((tweet: Tweet) => {
        logger.debug(`Tweet ${tweet.id}: "${tweet.text}"`);
      });

      // Filter for tweets containing $BTB (case-insensitive)
      const btbTweets = mentions.filter((tweet: Tweet) => 
        tweet.text.toLowerCase().includes('$btb')
      );

      logger.info(`Found ${btbTweets.length} $BTB tweets to process`);

      // Process each tweet
      for (const tweet of btbTweets) {
        const start = Date.now();
        try {
          // Skip if we've already processed this tweet
          if (this.processedTweetIds.has(tweet.id)) {
            logger.info('Already replied to this tweet, skipping', { tweetId: tweet.id });
            continue;
          }

          // Extract the question from the tweet
          const question = this.extractQuestion(tweet.text);
          
          if (!question) {
            logger.info('No question found in tweet, skipping', { tweetId: tweet.id });
            continue;
          }

          // Get knowledge base context
          const knowledgeContext = await this.knowledgeBaseService.searchKnowledge(question);
          
          // Count LLM request
          this.llmRequests++;

          // Create prompt with word limit instruction
          const prompt = `You are the BTB Finance Twitter account. Here's information about BTB: ${knowledgeContext}
          
          Someone tweeted: "${question}"
          
          Reply naturally and conversationally. If the info isn't in the knowledge base, still engage positively with their tweet. Never say "based on the knowledge base" or "limited information". Just respond like a normal crypto project would on Twitter. Keep it under 200 words, friendly and engaging.`;

          // Get OpenRouter's response
          const claudeResponse = await this.openRouterService.getResponse(prompt);

          // Format the response to fit Twitter's character limit
          const formattedResponse = this.formatTwitterResponse(claudeResponse);

          // Reply to the tweet
          await this.twitterService.replyToTweet(formattedResponse, tweet.id);

          logger.info('Successfully processed tweet', { tweetId: tweet.id });
          
          // Mark this tweet as processed
          this.processedTweetIds.add(tweet.id);
          
          // Update last processed tweet ID for next fetch
          this.lastProcessedTweetId = tweet.id;

          // Add a small delay between processing tweets to avoid rate limits
          await this.sleep(1000);

          this.mentionsReplied++;
          const elapsed = Date.now() - start;
          this.responseTimes.push(elapsed);
          const username = await this.getUsername(tweet.authorId);
          this.pushFeed({
            id: tweet.id,
            user: tweet.authorId,
            username,
            message: tweet.text,
            status: 'replied',
            time: new Date().toLocaleTimeString(),
            avatar: username ? username[0] : (tweet.authorId ? tweet.authorId[0] : 'U'),
            reply: formattedResponse,
            fullReply: claudeResponse,
          });
          this.pushActivity({
            color: 'green.400',
            text: `Replied to @${tweet.authorId}`,
            time: new Date().toLocaleTimeString(),
          });
          this.pushLog({
            id: tweet.id,
            level: 'info',
            message: `Replied to @${tweet.authorId}`,
            timestamp: new Date().toISOString(),
            details: formattedResponse,
          });
        } catch (error) {
          logger.error('Failed to process tweet:', error, { tweetId: tweet.id });
          this.pushLog({
            id: tweet.id,
            level: 'error',
            message: `Failed to process tweet ${tweet.id}`,
            timestamp: new Date().toISOString(),
            details: error?.toString(),
          });
          // Continue processing other tweets even if one fails
          continue;
        }
      }
    } catch (error: any) {
      logger.error('Failed to process $BTB tweets:', error);
      this.pushLog({
        id: Date.now(),
        level: 'error',
        message: 'Failed to process $BTB tweets',
        timestamp: new Date().toISOString(),
        details: error?.toString(),
      });
      // Update next poll time if we hit a rate limit
      if (error?.rateLimit) {
        this.updateNextPollTime(error.rateLimit);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private formatTwitterResponse(response: string): string {
    // Twitter's character limit is 280 characters
    const MAX_CHARS = 280;
    const MAX_WORDS = 200;
    
    // First check word count
    const words = response.trim().split(/\s+/);
    if (words.length > MAX_WORDS) {
      // Truncate to 200 words
      response = words.slice(0, MAX_WORDS).join(' ') + '...';
      logger.warn(`Response truncated from ${words.length} to ${MAX_WORDS} words`);
    }
    
    // Then check character count
    if (response.length <= MAX_CHARS) {
      return response;
    }

    // If still too long in characters, truncate further
    return response.substring(0, MAX_CHARS - 3) + '...';
  }

  // Start processing tweets at regular intervals
  async startProcessing(intervalMs: number = 900000): Promise<void> { // Default to 15 minutes for free API
    this.defaultIntervalMs = intervalMs;
    logger.info('Starting $BTB tweet processing...', { intervalMs });
    
    // Initial processing
    await this.processBTBTweets();

    // Set up interval for continuous processing
    while (true) {
      try {
        const now = new Date();
        const timeUntilNextPoll = Math.max(0, this.nextPollTime.getTime() - now.getTime());

        if (timeUntilNextPoll > 0) {
          logger.info('Waiting for next poll...', {
            timeUntilNextPoll,
            nextPollTime: this.nextPollTime.toISOString(),
          });
          await this.sleep(timeUntilNextPoll);
        }

        await this.processBTBTweets();
      } catch (error) {
        logger.error('Error in processing interval:', error);
        // Wait for the default interval before retrying
        await this.sleep(this.defaultIntervalMs);
      }
    }
  }

  // Process a single mention (for testing or manual invocation)
  async processMention(mention: any): Promise<void> {
    try {
      // Skip if we've already processed this tweet
      if (this.processedTweetIds.has(mention.id ?? '')) {
        logger.info('Already replied to this tweet, skipping', { tweetId: mention.id ?? 'unknown' });
        return;
      }

      // Extract the question from the tweet
      const question = this.extractQuestion(mention.text);
      if (!question) {
        logger.info('No question found in tweet, skipping', { tweetId: mention.id ?? 'unknown' });
        return;
      }

      // Get knowledge base context
      const knowledgeContext = await this.knowledgeBaseService.searchKnowledge(question);

      // Count LLM request
      this.llmRequests++;

      // Create prompt with word limit instruction
      const prompt = `You are the BTB Finance Twitter account. Here's information about BTB: ${knowledgeContext}
      
      Someone tweeted: "${question}"
      
      Reply naturally and conversationally. If the info isn't in the knowledge base, still engage positively with their tweet. Never say "based on the knowledge base" or "limited information". Just respond like a normal crypto project would on Twitter. Keep it under 200 words, friendly and engaging.`;

      // Get OpenRouter's response
      const start = Date.now();
      const claudeResponse = await this.openRouterService.getResponse(prompt);

      // Format the response to fit Twitter's character limit
      const formattedResponse = this.formatTwitterResponse(claudeResponse);

      // Reply to the tweet
      await this.twitterService.replyToTweet(formattedResponse, mention.id);

      logger.info('Successfully processed tweet', { tweetId: mention.id ?? 'unknown' });
      // Mark this tweet as processed
      this.processedTweetIds.add(mention.id ?? '');

      this.mentionsReplied++;
      const elapsed = Date.now() - start;
      this.responseTimes.push(elapsed);
      const username = await this.getUsername(mention.authorId);
      this.pushFeed({
        id: mention.id,
        user: mention.authorId,
        username,
        message: mention.text,
        status: 'replied',
        time: new Date().toLocaleTimeString(),
        avatar: username ? username[0] : (mention.authorId ? mention.authorId[0] : 'U'),
        reply: formattedResponse,
        fullReply: claudeResponse,
      });
      this.pushActivity({
        color: 'green.400',
        text: `Replied to @${mention.authorId}`,
        time: new Date().toLocaleTimeString(),
      });
      this.pushLog({
        id: mention.id,
        level: 'info',
        message: `Replied to @${mention.authorId}`,
        timestamp: new Date().toISOString(),
        details: formattedResponse,
      });
    } catch (error) {
      logger.error('Failed to process tweet:', error, { tweetId: mention?.id ?? 'unknown' });
      this.pushLog({
        id: mention?.id ?? Date.now(),
        level: 'error',
        message: `Failed to process tweet ${mention?.id ?? 'unknown'}`,
        timestamp: new Date().toISOString(),
        details: error?.toString(),
      });
    }
  }

  // --- Test/Dev Helper ---
  // Call this in your test/dev script to mock replies and avoid posting to Twitter
  static mockReplies(twitterService: TwitterService) {
    twitterService.replyToTweet = async (text: string, replyToTweetId: string) => {
      console.log(`[MOCK] Would reply to tweet ${replyToTweetId} with: ${text}`);
      await new Promise(res => setTimeout(res, 100));
    };
  }
}

// --- Example usage for safe local testing ---
// import { TwitterService } from './TwitterService';
// import { OpenRouterService } from './OpenRouterService';
// import { KnowledgeBaseService } from './KnowledgeBaseService';
//
// const twitterService = new TwitterService(...);
// const openRouterService = new OpenRouterService(...);
// const knowledgeBaseService = new KnowledgeBaseService(...);
//
// BTBTweetService.mockReplies(twitterService); // <-- Prevents real Twitter posts
//
// const btbTweetService = new BTBTweetService(
//   twitterService,
//   openRouterService,
//   knowledgeBaseService
// );
//
// await btbTweetService.processMention({
//   id: "1234567890123456789", // Use a valid numeric string for testing
//   text: "What is $BTB Finance?",
//   authorId: "9876543210987654321",
//   username: "TestUser",
//   createdAt: new Date()
// });