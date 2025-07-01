import { config as dotenvConfig } from 'dotenv';
import { AgentConfig } from '../types';
import { logger } from '../utils/logger';

const result = dotenvConfig();
if (result.error) {
  logger.error('Error loading .env file:', result.error);
}

function validateConfig(config: Partial<AgentConfig>): config is AgentConfig {
  const requiredFields = [
    'twitter.apiKey',
    'twitter.apiSecret',
    'twitter.accessToken',
    'twitter.accessTokenSecret',
    'twitter.bearerToken',
    'llm.apiKey',
    'wallet.privateKey',
    'wallet.rpcUrl'
  ];

  for (const field of requiredFields) {
    const value = field.split('.').reduce((obj, key) => obj?.[key], config as any);
    if (!value) {
      logger.error(`Missing configuration for ${field}. Available env vars:`, process.env);
      throw new Error(`Missing required configuration: ${field}`);
    }
  }

  return true;
}

export function loadConfig(): AgentConfig {
  logger.info('Loading configuration...');
  logger.debug('Environment variables:', {
    TWITTER_API_KEY: process.env.TWITTER_API_KEY,
    TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN ? '[REDACTED]' : undefined,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? '[REDACTED]' : undefined,
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
    WALLET_PRIVATE_KEY: process.env.WALLET_PRIVATE_KEY ? '[REDACTED]' : undefined,
    ETH_RPC_URL: process.env.ETH_RPC_URL,
  });

  const config: AgentConfig = {
    twitter: {
      apiKey: process.env.TWITTER_API_KEY || '',
      apiSecret: process.env.TWITTER_API_SECRET || '',
      accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
      bearerToken: process.env.TWITTER_BEARER_TOKEN || '',
    },
    llm: {
      provider: 'openrouter',
      apiKey: process.env.OPENROUTER_API_KEY || '',
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
      maxTokens: 1024,
    },
    wallet: {
      network: process.env.ETH_NETWORK || 'mainnet',
      rpcUrl: process.env.ETH_RPC_URL || '',
      privateKey: process.env.WALLET_PRIVATE_KEY || '',
    },
    monitoring: {
      enabled: true,
      interval: 60000,
      logLevel: 'info',
      enableMetrics: true,
    },
  };

  if (!validateConfig(config)) {
    throw new Error('Invalid configuration');
  }

  return config;
}
