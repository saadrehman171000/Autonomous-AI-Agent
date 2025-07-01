import path from 'path';
import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { TwitterService } from './services/TwitterService';
import { OpenRouterService } from './services/OpenRouterService';
import { KnowledgeBaseService } from './services/KnowledgeBaseService';
import { BTBTweetService } from './services/BTBTweetService';
import { logger } from './utils/logger';

// Load environment variables
config();

// --- Service Initialization ---
const twitterService = new TwitterService(
  process.env.TWITTER_API_KEY!,
  process.env.TWITTER_API_SECRET!,
  process.env.TWITTER_ACCESS_TOKEN!,
  process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  process.env.TWITTER_BEARER_TOKEN!
);

const openRouterService = new OpenRouterService(
  process.env.OPENROUTER_API_KEY!,
  process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet'
);

const knowledgeBaseService = new KnowledgeBaseService(openRouterService);
BTBTweetService.mockReplies(twitterService); // Prevent real Twitter posts in dev
const btbTweetService = new BTBTweetService(
  twitterService,
  openRouterService,
  knowledgeBaseService
);

// --- Express API Server ---
const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory settings for demo
let settings = {
  model: 'anthropic/claude-3.5-sonnet',
  temperature: 0.7,
  systemPrompt: 'You are a helpful AI assistant for BTB Finance.',
  testMode: true,
  autoReply: true,
  rateLimiting: true,
  responseDelay: 5,
  errorNotifications: true,
  notificationEmail: 'admin@btbfinance.com',
};

// POST /api/test-mention
app.post('/api/test-mention', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Missing text' });
      return;
    }
    const fakeMention = {
      id: Date.now().toString(),
      text,
      authorId: 'testuser',
      username: 'TestUser',
      createdAt: new Date(),
    };
    let reply = '';
    // Capture the reply by mocking replyToTweet
    let lastReply = '';
    twitterService.replyToTweet = async (msg: string, replyToTweetId: string) => {
      lastReply = msg;
      return;
    };
    await btbTweetService.processMention(fakeMention);
    reply = lastReply || 'No reply generated.';
    res.json({ reply });
    return;
  } catch (error: any) {
    logger.error('Error in /api/test-mention:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
    return;
  }
});

// GET /api/knowledge-base
app.get('/api/knowledge-base', async (req, res) => {
  try {
    const summary = await knowledgeBaseService.searchKnowledge('What is BTB Finance?');
    res.json({ summary });
    return;
  } catch (error: any) {
    logger.error('Error in /api/knowledge-base:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
    return;
  }
});

// GET /api/dashboard-stats
app.get('/api/dashboard-stats', async (req, res) => {
  try {
    res.json(btbTweetService.getStats());
    return;
  } catch (error: any) {
    logger.error('Error in /api/dashboard-stats:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
    return;
  }
});

// GET /api/live-feed
app.get('/api/live-feed', async (req, res) => {
  try {
    res.json({ feed: btbTweetService.getFeed() });
    return;
  } catch (error: any) {
    logger.error('Error in /api/live-feed:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
    return;
  }
});

// GET /api/logs
app.get('/api/logs', async (req, res) => {
  try {
    res.json({ logs: btbTweetService.getRecentLogs() });
    return;
  } catch (error: any) {
    logger.error('Error in /api/logs:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
    return;
  }
});

// GET /api/settings
app.get('/api/settings', async (req, res) => {
  try {
    res.json(settings);
    return;
  } catch (error: any) {
    logger.error('Error in /api/settings:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
    return;
  }
});

// POST /api/settings
app.post('/api/settings', async (req, res) => {
  try {
    settings = { ...settings, ...req.body };
    res.json({ success: true });
    return;
  } catch (error: any) {
    logger.error('Error in /api/settings:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
    return;
  }
});

// --- CLI/Test Mode ---
async function main() {
  try {
    logger.info('Starting Autonomous AI Agent (CLI/Test Mode)');
    // const fakeMention = {
    //   id: 'fake123',
    //   text: 'Hi @SaadRehman17100 what does $BTB do?',
    //   authorId: '9999999999',
    //   username: 'TestUser',
    // };
    // await btbTweetService.processMention(fakeMention);
    await btbTweetService.startProcessing(60000); // 1 minute polling
  } catch (error) {
    logger.error('Error in main loop:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  // Only start server if this file is run directly
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    logger.info(`API server listening on port ${PORT}`);
  });
  main();
}

export { app };