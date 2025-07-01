import axios from 'axios';
import { logger } from '../utils/logger';

export class OpenRouterService {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds between retries

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
    logger.info(`OpenRouter initialized with model: ${model}`);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        logger.warn(`OpenRouter API request failed (attempt ${i + 1}/${this.maxRetries}):`, {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        if (i < this.maxRetries - 1) {
          await this.delay(this.retryDelay);
        }
      }
    }
    
    throw lastError;
  }

  async getResponse(prompt: string): Promise<string> {
    return this.retryOperation(async () => {
      try {
        logger.info('Requesting OpenRouter response...', { 
          promptLength: prompt.length,
          model: this.model 
        });
        
        const response = await axios.post(
          `${this.baseUrl}/chat/completions`,
          {
            model: this.model,
            messages: [{
              role: 'user',
              content: prompt
            }],
            max_tokens: 1024,
            temperature: 0.7
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`,
              'HTTP-Referer': 'https://github.com/btb-finance/autonomous-ai-agent',
              'X-Title': 'BTB Finance AI Agent'
            },
            timeout: 30000 // 30 second timeout
          }
        );

        if (response.data?.choices?.[0]?.message?.content) {
          logger.info('Successfully received OpenRouter response');
          return response.data.choices[0].message.content;
        } else {
          logger.error('Unexpected response format from OpenRouter API', { 
            response: JSON.stringify(response.data) 
          });
          throw new Error('Unexpected response format from OpenRouter API');
        }
      } catch (error: any) {
        if (error.response) {
          logger.error('OpenRouter API error:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          });
        } else {
          logger.error('Failed to get OpenRouter response:', { 
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          });
        }
        throw error;
      }
    });
  }
}